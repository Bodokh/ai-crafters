import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('./replay.js', import.meta.url), 'utf8');

// Tests the measurement harness with known submission costs; no browser is started.
function fixture({ ready = true, hideAt = Infinity, stallAt = Infinity, webgl = false, queryNeverReady = false, externalQuery = false, disjointAt = Infinity } = {}) {
  let now = 0;
  let stalled = false;
  let disjointReported = false;
  let disjointChecks = 0;
  const ownedQueries = new Set();
  const external = externalQuery ? { external: true } : null;
  let activeQuery = external;
  const listeners = new Map();
  const root = { dataset: { renderer: webgl ? 'desktop' : 'mobile', sceneState: ready ? 'ready' : 'loading' } };
  const canvas = { id: 'neural-canvas', width: 390, height: 844, dataset: {} };
  const fieldCanvas = { id: 'neural-field', width: 390, height: 844, dataset: {} };
  class CanvasRenderingContext2D {
    constructor() { this.canvas = fieldCanvas; }
    clearRect() { now += 0.25; }
    drawImage() { now += 0.75; }
    fill() { now += 1; }
  }
  class WebGL2RenderingContext {
    constructor() {
      this.canvas = canvas;
      this.CURRENT_QUERY = 1;
      this.QUERY_RESULT_AVAILABLE = 2;
      this.QUERY_RESULT = 3;
    }
    clear() { now += 0.25; }
    drawElements() { now += 0.75; }
    drawArrays() { now += 1; }
    getExtension() { return { TIME_ELAPSED_EXT: 4, GPU_DISJOINT_EXT: 5 }; }
    isContextLost() { return false; }
    getParameter() {
      disjointChecks++;
      if (!disjointReported && now >= disjointAt) { disjointReported = true; return true; }
      return false;
    }
    getQuery() { return activeQuery; }
    createQuery() {
      const query = { readyAt: Infinity };
      ownedQueries.add(query);
      assert.ok(ownedQueries.size <= 8, 'GPU query queue must be bounded.');
      return query;
    }
    beginQuery(target, query) { assert.equal(activeQuery, null); activeQuery = query; }
    endQuery() {
      assert.ok(activeQuery && !activeQuery.external);
      activeQuery.readyAt = queryNeverReady ? Infinity : now + 5;
      activeQuery = null;
    }
    getQueryParameter(query, name) {
      if (name === this.QUERY_RESULT_AVAILABLE) return now >= query.readyAt;
      assert.ok(now >= query.readyAt, 'Never read a GPU result before it becomes available.');
      return 2500000;
    }
    deleteQuery(query) {
      assert.equal(query.external, undefined, 'Never delete an external query.');
      ownedQueries.delete(query);
    }
  }
  const originals = ['clearRect', 'drawImage', 'fill'].map(name => [name, CanvasRenderingContext2D.prototype[name]]);
  const glOriginals = ['clear', 'drawElements', 'drawArrays'].map(name => [name, WebGL2RenderingContext.prototype[name]]);
  const context2d = new CanvasRenderingContext2D();
  const contextWebgl = new WebGL2RenderingContext();
  const browser = {
    console, setTimeout, clearTimeout, queueMicrotask, CanvasRenderingContext2D, WebGL2RenderingContext,
    performance: { now: () => now },
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 1,
    scrollX: 0, scrollY: 17,
    location: { origin: 'http://example.test', pathname: '/baseline.html' },
    document: {
      documentElement: root,
      get hidden() { return now >= hideAt; },
      querySelector(selector) {
        if (selector === '.journey') return { getBoundingClientRect: () => ({ top: -browser.scrollY }) };
        if (selector === '.journey-stage') return { clientHeight: 844 };
        if (selector === '#neural-canvas') return canvas;
        if (selector === '#neural-field') return fieldCanvas;
        return null;
      },
      querySelectorAll: () => Array.from({ length: 19 }, () => ({})),
    },
    requestAnimationFrame(callback) {
      return setImmediate(() => {
        if (!stalled && now >= stallAt) { now += 400; stalled = true; }
        now += 1000 / 60;
        const timestamp = now;
        if (ready) {
          if (webgl) {
            contextWebgl.clear();
            contextWebgl.drawElements();
            contextWebgl.drawArrays();
          } else {
            context2d.clearRect();
            context2d.drawImage();
            context2d.fill();
          }
        }
        callback(timestamp);
      });
    },
    cancelAnimationFrame: clearImmediate,
    scrollTo({ top, left }) { browser.scrollY = top; browser.scrollX = left; },
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name, listener) { if (listeners.get(name) === listener) listeners.delete(name); },
  };
  browser.window = browser;
  const run = vm.runInNewContext(`(${source})`, browser);
  function assertRestored() {
    for (const [name, original] of originals) assert.equal(CanvasRenderingContext2D.prototype[name], original);
    for (const [name, original] of glOriginals) assert.equal(WebGL2RenderingContext.prototype[name], original);
    assert.equal(ownedQueries.size, 0, 'All benchmark GPU queries must be deleted.');
    assert.equal(activeQuery, external, 'External active query must remain unchanged.');
    if (externalQuery) assert.equal(disjointChecks, 0, 'Never consume the external query disjoint flag.');
    assert.equal(listeners.size, 0);
    assert.equal(browser.scrollY, 17);
    assert.equal(browser.scrollX, 0);
  }
  return { run, assertRestored, browser };
}

test('known submission cost, checkpoint labels, empty inactive canvas, warmup exclusion, and restoration', async () => {
  const { run, assertRestored } = fixture();
  const result = await run({ durationMs: 8000 });
  assert.equal(result.field.submissionEnvelopeMs.p50, 2);
  assert.equal(result.field.submissionEnvelopeMs.p95, 2);
  assert.equal(result.field.submissionEnvelopeMs.max, 2);
  assert.equal(result.field.drawingCallsPerSubmission.p50, 2);
  assert.equal(result.scene.all.submissionEnvelopeMs.samples, 0);
  assert.equal(result.scene.all.submissionEnvelopeMs.p50, null);
  assert.deepEqual(Array.from(result.checkpoints, point => point.commandedSegment), [
    'checkpoint-0', 'checkpoint-5', 'checkpoint-10', 'checkpoint-15',
  ]);
  assert.ok(result.field.renderSubmissions > 400 && result.field.renderSubmissions < 440,
    'Only measured replay submissions should be included, excluding readiness and warmup.');
  assert.equal(result.readiness.sceneReadyAtInvocation, true);
  assert.equal(result.readiness.observedSceneReadyFromNavigationMs, null);
  assert.equal(result.scene.all.appRenderCountDelta, undefined);
  assert.equal(result.scene.appRenderCountDelta, null);
  assertRestored();
});

test('mobile validates and reports actual primary rendering on neural-field', async () => {
  const { run, assertRestored } = fixture();
  const result = await run({ durationMs: 8000 });
  assert.equal(result.profile, 'mobile');
  assert.equal(result.primaryCanvasId, 'neural-field');
  assert.equal(result.finalSnapshot.canvasId, 'neural-field');
  assert.equal(result.finalSnapshot.canvasWidth, 390);
  assert.equal(result.field.replayTravel.submissionEnvelopeMs.p50, 2);
  assert.ok(result.field.replayTravel.renderSubmissions > 0);
  assert.equal(result.scene.all.renderSubmissions, 0);
  assertRestored();
});

test('RAF stalls crossing replay boundaries remain visible in global statistics', async () => {
  const { run, assertRestored } = fixture({ stallAt: 1500 });
  const result = await run({ durationMs: 8000 });
  assert.ok(result.rafIntervalMs.all.max >= 400);
  assert.ok(result.rafIntervalMs.replayCheckpoints.max < 30);
  assert.ok(result.rafIntervalMs.replayTravel.max < 30);
  assertRestored();
});

test('readiness failure restores canvas methods, listeners, and scroll', async () => {
  const { run, assertRestored } = fixture({ ready: false });
  await assert.rejects(run({ readyTimeoutMs: 1000 }), /Scene did not become ready/);
  assertRestored();
});

test('visibility failure during replay restores canvas methods, listeners, and scroll', async () => {
  const { run, assertRestored } = fixture({ hideAt: 1600 });
  await assert.rejects(run({ durationMs: 8000 }), /became hidden during replay/);
  assertRestored();
});

test('GPU results are read only when available, paired with travel frames, and disposed', async () => {
  const { run, assertRestored } = fixture({ webgl: true });
  const result = await run({ durationMs: 8000, gpuTiming: true });
  assert.equal(result.gpuTiming.supported, true);
  assert.equal(result.gpuTiming.created, result.gpuTiming.resolved);
  assert.equal(result.gpuTiming.pendingAtEnd, 0);
  assert.equal(result.scene.all.gpuTimeMs.p50, 2.5);
  assert.equal(result.scene.replayTravel.gpuTimeMs.p95, 2.5);
  assert.equal(result.field.replayTravel.submissionEnvelopeMs.samples, 0);
  assertRestored();
});

test('GPU queries discard disjoint results and resume collecting valid frames', async () => {
  const { run, assertRestored } = fixture({ webgl: true, disjointAt: 1500 });
  const result = await run({ durationMs: 8000, gpuTiming: true });
  assert.ok(result.gpuTiming.discardedDisjoint > 0);
  assert.equal(result.gpuTiming.created, result.gpuTiming.resolved + result.gpuTiming.discardedDisjoint);
  assertRestored();
});

test('GPU queries stop at eight pending and cleanup unresolved queries without blocking', async () => {
  const { run, assertRestored } = fixture({ webgl: true, queryNeverReady: true });
  const result = await run({ durationMs: 8000, gpuTiming: true });
  assert.equal(result.gpuTiming.created, 8);
  assert.equal(result.gpuTiming.peakPending, 8);
  assert.equal(result.gpuTiming.pendingAtEnd, 8);
  assert.equal(result.scene.all.gpuTimeMs.samples, 0);
  assert.ok(result.gpuTiming.skippedQueueFull > 0);
  assertRestored();
});

test('GPU instrumentation leaves an external active query untouched', async () => {
  const { run, assertRestored } = fixture({ webgl: true, externalQuery: true });
  const result = await run({ durationMs: 8000, gpuTiming: true });
  assert.equal(result.gpuTiming.created, 0);
  assert.ok(result.gpuTiming.skippedExternalQuery > 0);
  assertRestored();
});

test('GPU queries are disposed when the tab is hidden during a run', async () => {
  const { run, assertRestored } = fixture({ webgl: true, queryNeverReady: true, hideAt: 1600 });
  await assert.rejects(run({ durationMs: 8000, gpuTiming: true }), /became hidden during replay/);
  assertRestored();
});
