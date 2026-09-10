import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobileNeuralScene, createMobileRoute, sampleMobileRoute } from './mobile-scene.js';

const sides = Array.from({ length: 19 }, (_, index) => index % 3 ? 'left' : 'right');

// A deterministic 60Hz event loop checks real scheduling behavior, including
// time spent drawing. Canvas methods are faked; no browser is started.
function createHarness({ drawCost = 1, nullContext = false, withImages = false } = {}) {
  let now = 0, id = 0;
  const events = new Map(), sprites = [], frames = [], clears = [];
  const images = [], spriteCopies = [];
  const document = new EventTarget();
  const subscriptions = new Set();
  const addEvent = document.addEventListener.bind(document);
  const removeEvent = document.removeEventListener.bind(document);
  document.addEventListener = (name, listener) => { subscriptions.add(listener); addEvent(name, listener); };
  document.removeEventListener = (name, listener) => { subscriptions.delete(listener); removeEvent(name, listener); };
  document.hidden = false;
  let failDraw = false;
  const window = {
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
    performance: { now: () => now },
    requestAnimationFrame: callback => {
      const handle = ++id;
      const due = (Math.floor((now + .001) / (1000 / 60)) + 1) * (1000 / 60);
      events.set(handle, { due, callback, raf: true });
      return handle;
    },
    cancelAnimationFrame: handle => events.delete(handle),
    setTimeout: (callback, delay) => {
      const handle = ++id;
      events.set(handle, { due: now + delay, callback });
      return handle;
    },
    clearTimeout: handle => events.delete(handle),
  };
  document.defaultView = window;
  if (withImages) window.Image = class {
    constructor() {
      this.naturalWidth = this.naturalHeight = 288;
      this.decoding = '';
      this.decodePromise = new Promise((resolve, reject) => {
        this.finishDecode = resolve;
        this.failDecode = reject;
      });
      images.push(this);
    }
    decode() { return this.decodePromise; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
  };
  const gradient = { addColorStop() {} };
  function context(main = false) {
    let transform = [1, 0, 0, 1, 0, 0], currentFrame;
    const ctx = {
      setTransform(...value) { transform = value; },
      clearRect(...rectangle) {
        if (!main) return;
        currentFrame = { time: now, images: 0, operations: 0 };
        clears.push({ rectangle, transform: [...transform] });
        now += drawCost;
      },
      drawImage(...args) {
        if (!main) { spriteCopies.push(args); return; }
        if (failDraw) throw new Error('Simulated canvas failure');
        assert.ok(args.slice(1).every(Number.isFinite));
        if (!currentFrame.images++) frames.push(currentFrame);
      },
      createRadialGradient: () => gradient,
      translate() {},
      beginPath() {},
      closePath() {},
      moveTo() {},
      lineTo() {},
      quadraticCurveTo() {},
      stroke() { if (currentFrame) currentFrame.operations++; },
      fill() {},
      arc() {},
      fillRect() {},
    };
    return ctx;
  }
  function createCanvas(main = false) {
    const ctx = context(main);
    return {
      ownerDocument: document,
      width: 300, height: 150,
      clientWidth: main ? 390 : 0,
      clientHeight: main ? 844 : 0,
      getContext: () => main && nullContext ? null : ctx,
      dataset: new Proxy({}, { set() { throw new Error('Per-frame DOM diagnostics are forbidden'); } }),
    };
  }
  document.createElement = name => {
    assert.equal(name, 'canvas');
    const sprite = createCanvas();
    sprites.push(sprite);
    return sprite;
  };
  const canvas = createCanvas(true);
  return {
    canvas, window, document, events, sprites, frames, clears, subscriptions, images, spriteCopies,
    setFailure(value) { failDraw = value; },
    run(duration) {
      const until = now + duration;
      let iterations = 0;
      while (events.size) {
        const [handle, event] = [...events.entries()].sort((a, b) => a[1].due - b[1].due)[0];
        if (event.due > until) break;
        assert.ok(iterations++ < 2000, 'Scheduler must yield between frames');
        events.delete(handle);
        now = Math.max(now, event.due);
        event.callback(event.raf ? now : undefined);
      }
      now = Math.max(now, until);
    },
    visibility(hidden) {
      document.hidden = hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    },
  };
}

test('checkpoint positions match physical card sides and reverse scrolling retraces the route', () => {
  const route = createMobileRoute(sides);
  assert.equal(route.nodes.length, 19);
  for (let index = 0; index < sides.length; index++) {
    assert.deepEqual(sampleMobileRoute(route.camera, index), route.camera[index]);
    assert.deepEqual(sampleMobileRoute(route.nodes, index), route.nodes[index]);
    assert.equal(Math.sign(route.nodes[index].x - route.camera[index].x), sides[index] === 'left' ? 1 : -1);
    assert.ok(Math.abs(route.nodes[index].z - route.camera[index].z - 5.2) < 1e-10);
  }
  const samples = Array.from({ length: 181 }, (_, index) => sampleMobileRoute(route.nodes, index / 10));
  for (let index = samples.length - 1; index >= 0; index--) {
    assert.deepEqual(sampleMobileRoute(route.nodes, index / 10), samples[index]);
  }
  assert.deepEqual(sampleMobileRoute(route.nodes, -10), route.nodes[0]);
  assert.deepEqual(sampleMobileRoute(route.nodes, 100), route.nodes.at(-1));
});

test('paused setup never draws or schedules and first real draw announces readiness once', () => {
  const harness = createHarness();
  let ready = 0;
  const scene = createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides,
    initiallyPaused: true, onReady: () => ready++ });
  scene.setProgress(.4);
  scene.setTravel(.3);
  scene.setActivity(1);
  scene.resize();
  harness.run(1000);
  assert.equal(harness.events.size, 0);
  assert.equal(harness.frames.length, 0);
  assert.equal(ready, 0);
  scene.setPaused(false);
  harness.run(200);
  assert.equal(ready, 1);
  assert.ok(harness.frames.length > 1);
  assert.equal(harness.canvas.width, 390, 'DPR is capped at one on a DPR3 phone');
  assert.ok(harness.frames.every(frame => frame.images <= 72 && frame.operations < 18),
    `Visible draw work is bounded: ${Math.max(...harness.frames.map(frame => frame.images))} images`);
  scene.setPaused(true);
  const rendered = harness.frames.length;
  const clears = harness.clears.length;
  harness.canvas.clientWidth = 420;
  scene.resize();
  harness.run(1000);
  assert.equal(harness.frames.length, rendered);
  assert.equal(harness.clears.length, clears, 'Resize preserves the frozen frame until resumed');
  assert.equal(harness.events.size, 0);
  scene.setPaused(false);
  harness.run(100);
  assert.equal(ready, 1);
  assert.equal(harness.canvas.width, 420);
  scene.dispose();
});

test('actual draw cadence stays near 30fps traveling and 18fps idle despite drawing cost', () => {
  const moving = createHarness({ drawCost: 1 });
  const scene = createMobileNeuralScene({ canvas: moving.canvas, cardSides: sides });
  for (let index = 0; index < 120; index++) {
    scene.setActivity(1);
    scene.setProgress(index / 120);
    moving.run(1000 / 60);
  }
  const duration = moving.frames.at(-1).time - moving.frames[0].time;
  const movingFps = (moving.frames.length - 1) / duration * 1000;
  assert.ok(movingFps >= 28 && movingFps <= 31, `Moving cadence: ${movingFps.toFixed(2)}fps`);
  scene.dispose();
  const idle = createHarness({ drawCost: 1 });
  const idleScene = createMobileNeuralScene({ canvas: idle.canvas, cardSides: sides });
  idle.run(2500);
  const idleDuration = idle.frames.at(-1).time - idle.frames[0].time;
  const idleFps = (idle.frames.length - 1) / idleDuration * 1000;
  assert.ok(idleFps >= 17 && idleFps <= 19, `Idle cadence: ${idleFps.toFixed(2)}fps`);
  idleScene.dispose();
});

test('hidden documents stop all scheduling and abort releases owned sprites/listeners', () => {
  const harness = createHarness();
  const controller = new AbortController();
  let errors = 0;
  const scene = createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides,
    signal: controller.signal, onError: () => errors++ });
  harness.run(100);
  harness.visibility(true);
  const count = harness.frames.length;
  scene.setProgress(.7);
  scene.setActivity(1);
  harness.run(1000);
  assert.equal(harness.frames.length, count);
  assert.equal(harness.events.size, 0);
  harness.visibility(false);
  harness.run(100);
  assert.ok(harness.frames.length > count);
  controller.abort();
  const finalCount = harness.frames.length;
  scene.setPaused(false);
  scene.resize();
  scene.setProgress(1);
  harness.run(1000);
  assert.equal(harness.frames.length, finalCount);
  assert.equal(harness.events.size, 0);
  assert.equal(harness.subscriptions.size, 0);
  assert.ok(harness.sprites.every(sprite => sprite.width === 1 && sprite.height === 1));
  assert.equal(errors, 0);
  scene.dispose();
});

test('sustained slow drawing lowers resolution and disposal clears the full bitmap', () => {
  const harness = createHarness({ drawCost: 10 });
  const scene = createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides });
  harness.run(5000);
  assert.equal(harness.canvas.width, Math.round(390 * .72));
  assert.equal(harness.canvas.height, Math.round(844 * .72));
  scene.dispose();
  assert.deepEqual(harness.clears.at(-1), {
    rectangle: [0, 0, harness.canvas.width, harness.canvas.height],
    transform: [1, 0, 0, 1, 0, 0],
  });
  assert.equal(harness.events.size, 0);
});

test('abort before setup and unavailable contexts fail without starting a renderer', () => {
  const harness = createHarness();
  const controller = new AbortController();
  controller.abort();
  assert.throws(() => createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides,
    signal: controller.signal }), { name: 'AbortError' });
  assert.equal(harness.sprites.length, 0);
  assert.equal(harness.events.size, 0);
  const unsupported = createHarness({ nullContext: true });
  assert.throws(() => createMobileNeuralScene({ canvas: unsupported.canvas, cardSides: sides }), /Canvas2D/);
  assert.equal(unsupported.events.size, 0);
});

test('draw failures report once and readiness callbacks can pause immediately', () => {
  const broken = createHarness();
  let errors = 0;
  createMobileNeuralScene({ canvas: broken.canvas, cardSides: sides,
    onError: () => errors++ });
  broken.setFailure(true);
  broken.run(500);
  assert.equal(errors, 1);
  assert.equal(broken.events.size, 0);
  assert.equal(broken.subscriptions.size, 0);
  const harness = createHarness();
  let scene;
  scene = createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides,
    onReady: () => scene.setPaused(true) });
  harness.run(500);
  assert.equal(harness.frames.length, 1);
  assert.equal(harness.events.size, 0);
  scene.dispose();
});

test('baked sprites load after the first useful frame and reuse the four existing canvases', async () => {
  const harness = createHarness({ withImages: true });
  let ready = 0;
  const scene = createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides,
    onReady: () => ready++ });
  assert.equal(harness.images.length, 0);
  harness.run(18);
  assert.equal(ready, 1, 'Readiness must not wait for a network image');
  assert.equal(harness.frames.length, 1);
  assert.equal(harness.images.length, 0, 'No asset request competes with the first useful frame');
  const originalCanvases = [...harness.sprites];
  harness.run(18);
  assert.equal(harness.images.length, 4);
  assert.ok(harness.images.every(image => image.decoding === 'async'));
  for (const image of harness.images) { image.onload(); image.finishDecode(); }
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.spriteCopies.length, 4);
  assert.deepEqual(harness.sprites, originalCanvases, 'Decode reuses the same owned raster surfaces');
  assert.ok(harness.sprites.slice(2).every(sprite => sprite.width === 288 && sprite.height === 288));
  harness.run(100);
  assert.equal(ready, 1);
  assert.ok(harness.frames.every(frame => frame.images <= 72));
  scene.dispose();
});

test('failed, invalid, and late image decodes retain the fallback without reviving a disposed scene', async () => {
  const harness = createHarness({ withImages: true });
  const controller = new AbortController();
  let errors = 0;
  createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides, signal: controller.signal,
    onError: () => errors++ });
  harness.run(40);
  const [failedLoad, failedDecode, wrongSize, lateDecode] = harness.images;
  failedLoad.onerror();
  failedDecode.onload();
  failedDecode.failDecode(new Error('Unsupported image'));
  wrongSize.naturalWidth = 1;
  wrongSize.onload();
  wrongSize.finishDecode();
  lateDecode.onload();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.spriteCopies.length, 0);
  controller.abort();
  lateDecode.finishDecode();
  await Promise.resolve();
  await Promise.resolve();
  harness.run(300);
  assert.equal(harness.spriteCopies.length, 0, 'Late decodes cannot repaint disposed canvases');
  assert.ok(harness.sprites.every(sprite => sprite.width === 1 && sprite.height === 1));
  assert.equal(harness.events.size, 0);
  assert.equal(harness.subscriptions.size, 0);
  assert.equal(errors, 0, 'Optional image upgrades never fail the functioning renderer');
  assert.ok(harness.images.every(image => image.onload === null && image.onerror === null));
});

test('disposing from the readiness callback cancels the deferred image upgrade', () => {
  const harness = createHarness({ withImages: true });
  let scene;
  scene = createMobileNeuralScene({ canvas: harness.canvas, cardSides: sides,
    onReady: () => scene.dispose() });
  harness.run(500);
  assert.equal(harness.images.length, 0);
  assert.equal(harness.events.size, 0);
});
