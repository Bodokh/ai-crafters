async function runRenderBenchmark(options) {
  'use strict';
  options = options || {};

  // Evaluate as `(<this entire file>)({ label: 'baseline', durationMs: 10000 })`.
  // No application module, animation parameter, or RAF callback is replaced.
  const durationMs = Math.max(8000, Math.min(12000, Number(options.durationMs) || 10000));
  const readyTimeoutMs = Math.max(1000, Math.min(20000, Number(options.readyTimeoutMs) || 15000));
  const root = document.documentElement;
  const journey = document.querySelector('.journey');
  const stage = document.querySelector('.journey-stage');
  const sceneCanvas = document.querySelector('#neural-canvas');
  const fieldCanvas = document.querySelector('#neural-field');
  if (!journey || !stage || !sceneCanvas) throw new Error('Neural homepage elements are missing.');
  if (document.hidden) throw new Error('Keep the benchmark tab visible.');
  if (root.dataset.renderer !== 'desktop' && root.dataset.renderer !== 'mobile') {
    throw new Error('Wait for the homepage module to select its renderer before benchmarking.');
  }

  const profile = root.dataset.renderer;
  const primaryCanvas = profile === 'mobile' ? fieldCanvas : sceneCanvas;
  if (!primaryCanvas) throw new Error(`Primary ${profile} canvas is missing.`);
  const beats = document.querySelectorAll('.story-beat').length;
  if (beats < 16) throw new Error('Replay requires at least 16 story beats.');
  const readingHold = profile === 'mobile' ? 0.4 : 0.2;
  const scrollSpeed = profile === 'mobile' ? 1.6875 : 1.35;
  const openingLength = 0.5;
  const endingLength = 0.5;
  const layoutHeight = profile === 'mobile' ? stage.clientHeight || innerHeight : innerHeight;
  const unit = layoutHeight * (innerWidth < 700 ? 1.65 : 1.6) / scrollSpeed;
  const journeyTop = scrollY + journey.getBoundingClientRect().top;
  const originalScroll = { left: scrollX, top: scrollY };
  const initialViewport = { width: innerWidth, height: innerHeight, dpr: devicePixelRatio };
  const invocationTime = performance.now();
  const sceneReadyAtInvocation = root.dataset.sceneState === 'ready';
  const errors = [];
  const restorers = [];
  const pendingFrames = new Map();
  const frames = [];
  const rafSamples = [];
  const longTasks = [];
  const checkpoints = [];
  const gpuContexts = new Map();
  const gpuTiming = {
    requested: options.gpuTiming === true, supported: false, maxPendingPerContext: 8,
    created: 0, resolved: 0, discardedDisjoint: 0, skippedExternalQuery: 0,
    skippedQueueFull: 0, invalid: 0, peakPending: 0, warnings: [],
  };
  let measuring = false;
  let currentSegment = null;
  let observer = null;
  let runStart = null;
  let runEnd = null;
  let rafId = null;
  let watchdog = null;
  let observedReadyTime = sceneReadyAtInvocation ? null : undefined;
  let readinessWaitMs = null;
  let renderCountStart = null;

  const round = value => Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
  function stats(values) {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return { samples: 0, p50: null, p95: null, max: null, mean: null };
    const percentile = p => sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)];
    return {
      samples: sorted.length,
      p50: round(percentile(0.5)),
      p95: round(percentile(0.95)),
      max: round(sorted[sorted.length - 1]),
      mean: round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length),
    };
  }
  function recordError(event) {
    if (errors.length < 12) errors.push(String(event.message || event.reason?.message || event.reason || 'Browser error').slice(0, 300));
  }
  function snapshot() {
    return {
      commandedSegment: currentSegment?.id ?? null,
      beat: root.dataset.beat ?? null,
      progress: root.dataset.progress ?? null,
      sceneState: root.dataset.sceneState ?? null,
      station: primaryCanvas.dataset.station ?? null,
      renderMode: primaryCanvas.dataset.renderMode ?? null,
      renderCount: Number(primaryCanvas.dataset.renderCount) || null,
      drawCalls: Number(primaryCanvas.dataset.drawCalls) || null,
      triangles: Number(primaryCanvas.dataset.triangles) || null,
      canvasId: primaryCanvas.id,
      canvasWidth: primaryCanvas.width,
      canvasHeight: primaryCanvas.height,
      scrollY: round(scrollY),
    };
  }
  function canvasName(context) {
    if (context.canvas === sceneCanvas) return 'scene';
    if (context.canvas === fieldCanvas) return 'field';
    return null;
  }
  function gpuWarning(error) {
    if (gpuTiming.warnings.length < 4) gpuTiming.warnings.push(String(error?.message || error).slice(0, 200));
  }
  function deleteGpuQuery(state, record) {
    try { state.gl.deleteQuery(record.query); } catch (error) { gpuWarning(error); }
  }
  function beginGpuQuery(gl, frame) {
    if (!gpuTiming.requested || frame.canvas !== 'scene' || frame.kind !== 'webgl') return;
    let state = gpuContexts.get(gl);
    if (!state) {
      state = { gl, extension: null, pending: [], disabled: false, clearedInitialDisjoint: false };
      gpuContexts.set(gl, state);
      try {
        if (typeof gl.createQuery === 'function') state.extension = gl.getExtension('EXT_disjoint_timer_query_webgl2');
        if (state.extension) {
          gpuTiming.supported = true;
        }
      } catch (error) { state.disabled = true; gpuWarning(error); }
    }
    if (!state.extension || state.disabled || gl.isContextLost?.()) return;
    if (state.pending.length >= gpuTiming.maxPendingPerContext) { gpuTiming.skippedQueueFull++; return; }
    let query = null;
    try {
      if (gl.getQuery(state.extension.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) { gpuTiming.skippedExternalQuery++; return; }
      if (!state.clearedInitialDisjoint) {
        // Reading this flag clears its history: defer until no external query is active.
        gl.getParameter(state.extension.GPU_DISJOINT_EXT);
        state.clearedInitialDisjoint = true;
      }
      query = gl.createQuery();
      if (!query) { gpuTiming.invalid++; return; }
      gl.beginQuery(state.extension.TIME_ELAPSED_EXT, query);
      frame.gpuQuery = { query, state, frame };
      gpuTiming.created++;
    } catch (error) {
      if (query) deleteGpuQuery(state, { query });
      state.disabled = true;
      gpuWarning(error);
    }
  }
  function endGpuQuery(frame) {
    const record = frame.gpuQuery;
    if (!record) return;
    delete frame.gpuQuery;
    const { state } = record;
    const { gl, extension } = state;
    try {
      // Do not end another tool's query if it replaced/ended ours unexpectedly.
      if (gl.getQuery(extension.TIME_ELAPSED_EXT, gl.CURRENT_QUERY) !== record.query) {
        gpuTiming.invalid++;
        deleteGpuQuery(state, record);
        return;
      }
      gl.endQuery(extension.TIME_ELAPSED_EXT);
      if (frame.drawCalls) {
        state.pending.push(record);
        gpuTiming.peakPending = Math.max(gpuTiming.peakPending, state.pending.length);
      } else {
        gpuTiming.invalid++;
        deleteGpuQuery(state, record);
      }
    } catch (error) {
      deleteGpuQuery(state, record);
      state.disabled = true;
      gpuTiming.invalid++;
      gpuWarning(error);
    }
  }
  function pollGpuQueries() {
    for (const state of gpuContexts.values()) {
      if (!state.extension || !state.pending.length) continue;
      const { gl, extension } = state;
      try {
        // Preserve the disjoint flag for an external query that started between frames.
        if (gl.getQuery(extension.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) continue;
        const lost = Boolean(gl.isContextLost?.());
        const disjoint = !lost && gl.getParameter(extension.GPU_DISJOINT_EXT);
        if (lost || disjoint || state.disabled) {
          if (disjoint) gpuTiming.discardedDisjoint += state.pending.length;
          else gpuTiming.invalid += state.pending.length;
          for (const record of state.pending) deleteGpuQuery(state, record);
          state.pending.length = 0;
          continue;
        }
        const stillPending = [];
        for (const record of state.pending) {
          // Only availability is polled. Never request a result before it is ready.
          if (!gl.getQueryParameter(record.query, gl.QUERY_RESULT_AVAILABLE)) { stillPending.push(record); continue; }
          const nanoseconds = gl.getQueryParameter(record.query, gl.QUERY_RESULT);
          if (Number.isFinite(nanoseconds) && nanoseconds >= 0) {
            record.frame.gpuTimeMs = nanoseconds / 1e6;
            gpuTiming.resolved++;
          } else gpuTiming.invalid++;
          deleteGpuQuery(state, record);
        }
        state.pending = stillPending;
      } catch (error) {
        state.disabled = true;
        gpuTiming.invalid += state.pending.length;
        for (const record of state.pending) deleteGpuQuery(state, record);
        state.pending.length = 0;
        gpuWarning(error);
      }
    }
  }
  function pendingGpuQueries() {
    return [...gpuContexts.values()].reduce((total, state) => total + state.pending.length, 0);
  }
  function finishFrame(context) {
    const frame = pendingFrames.get(context);
    if (!frame) return;
    pendingFrames.delete(context);
    endGpuQuery(frame);
    if (!frame.drawCalls) return; // A disposal clear is not a render submission.
    frame.submissionEnvelopeMs = frame.lastSubmission - frame.started;
    if (frame.canvas === 'scene') {
      frame.renderMode = sceneCanvas.dataset.renderMode || null;
      frame.reportedDrawCalls = Number(sceneCanvas.dataset.drawCalls) || null;
      frame.reportedTriangles = Number(sceneCanvas.dataset.triangles) || null;
    }
    frames.push(frame);
  }
  function wrapMethod(prototype, name, clear, kind) {
    if (!prototype) return;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
    if (!descriptor || typeof descriptor.value !== 'function') return;
    const original = descriptor.value;
    const wrapped = function (...args) {
      const canvas = measuring ? canvasName(this) : null;
      if (!canvas) return Reflect.apply(original, this, args);
      if (clear) {
        finishFrame(this);
        const frame = {
          canvas, kind, started: performance.now(), lastSubmission: 0,
          segment: currentSegment.id, phase: currentSegment.phase, drawCalls: 0,
        };
        pendingFrames.set(this, frame);
        beginGpuQuery(this, frame);
        frame.started = performance.now();
        queueMicrotask(() => finishFrame(this));
      }
      const result = Reflect.apply(original, this, args);
      const frame = pendingFrames.get(this);
      if (frame) {
        if (!clear) frame.drawCalls++;
        frame.lastSubmission = performance.now();
      }
      return result;
    };
    Object.defineProperty(prototype, name, { ...descriptor, value: wrapped });
    restorers.push(() => {
      if (prototype[name] === wrapped) Object.defineProperty(prototype, name, descriptor);
    });
  }
  function installInstrumentation() {
    const canvasPrototype = globalThis.CanvasRenderingContext2D?.prototype;
    wrapMethod(canvasPrototype, 'clearRect', true, 'canvas2d');
    // Counts/timestamps only raster submission methods; never per-vertex path methods.
    for (const name of ['drawImage', 'fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'putImageData']) {
      wrapMethod(canvasPrototype, name, false, 'canvas2d');
    }
    for (const Constructor of [globalThis.WebGLRenderingContext, globalThis.WebGL2RenderingContext]) {
      const prototype = Constructor?.prototype;
      wrapMethod(prototype, 'clear', true, 'webgl');
      for (const name of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements']) {
        wrapMethod(prototype, name, false, 'webgl');
      }
    }
    if (globalThis.PerformanceObserver?.supportedEntryTypes?.includes('longtask')) {
      observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) longTasks.push({ startTime: entry.startTime, duration: entry.duration });
      });
      observer.observe({ type: 'longtask', buffered: false });
    }
    window.addEventListener('error', recordError);
    window.addEventListener('unhandledrejection', recordError);
  }
  function nextFrame() {
    return new Promise((resolve, reject) => {
      watchdog = setTimeout(() => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        reject(new Error('No RAF arrived within 2 seconds; keep the tab visible.'));
      }, 2000);
      rafId = requestAnimationFrame(time => {
        clearTimeout(watchdog);
        watchdog = null;
        rafId = null;
        resolve(time);
      });
    });
  }
  function scrollToBeatPosition(position) {
    window.scrollTo({ top: journeyTop + unit * position, left: originalScroll.left, behavior: 'instant' });
  }
  const position = beat => openingLength + beat + readingHold / 2;
  const segments = [
    { id: 'checkpoint-0', phase: 'checkpoint', from: position(0), to: position(0), weight: 0.08 },
    { id: 'travel-0-to-5', phase: 'travel', from: position(0), to: position(5), weight: 0.16 },
    { id: 'checkpoint-5', phase: 'checkpoint', from: position(5), to: position(5), weight: 0.08 },
    { id: 'travel-5-to-10', phase: 'travel', from: position(5), to: position(10), weight: 0.18 },
    { id: 'checkpoint-10', phase: 'checkpoint', from: position(10), to: position(10), weight: 0.08 },
    { id: 'travel-10-to-15', phase: 'travel', from: position(10), to: position(15), weight: 0.18 },
    { id: 'checkpoint-15', phase: 'checkpoint', from: position(15), to: position(15), weight: 0.08 },
    { id: 'travel-15-to-5', phase: 'travel', from: position(15), to: position(5), weight: 0.16 },
  ];
  let accumulated = 0;
  for (const segment of segments) {
    segment.startMs = accumulated;
    accumulated += segment.weight * durationMs;
    segment.endMs = accumulated;
  }
  function summarizeFrames(selected, sameSegmentOnly = false) {
    const intervals = [];
    for (let index = 1; index < selected.length; index++) {
      const previous = selected[index - 1];
      const current = selected[index];
      if (!sameSegmentOnly || previous.segment === current.segment) intervals.push(current.started - previous.started);
    }
    return {
      renderSubmissions: selected.length,
      submissionEnvelopeMs: stats(selected.map(frame => frame.submissionEnvelopeMs)),
      gpuTimeMs: stats(selected.map(frame => frame.gpuTimeMs)),
      submissionIntervalMs: stats(intervals),
      drawingCallsPerSubmission: stats(selected.map(frame => frame.drawCalls)),
      reportedDrawCalls: stats(selected.map(frame => frame.reportedDrawCalls).filter(Number.isFinite)),
      reportedTriangles: stats(selected.map(frame => frame.reportedTriangles).filter(Number.isFinite)),
      appTravelTaggedSubmissions: selected.filter(frame => frame.renderMode === 'travel').length,
      appAmbientTaggedSubmissions: selected.filter(frame => frame.renderMode === 'ambient').length,
    };
  }

  try {
    installInstrumentation();
    scrollToBeatPosition(position(0));
    const readinessStarted = performance.now();
    while (root.dataset.sceneState !== 'ready') {
      if (performance.now() - readinessStarted > readyTimeoutMs) throw new Error(`Scene did not become ready: ${root.dataset.sceneState}`);
      await nextFrame();
    }
    if (!sceneReadyAtInvocation) observedReadyTime = performance.now();
    readinessWaitMs = performance.now() - readinessStarted;
    // Same settling time for both pages; no source scheduler or easing changes.
    const settleStarted = performance.now();
    while (performance.now() - settleStarted < 900) await nextFrame();
    if (document.hidden) throw new Error('Benchmark tab became hidden.');

    runStart = await nextFrame();
    renderCountStart = Number(sceneCanvas.dataset.renderCount) || null;
    currentSegment = segments[0];
    measuring = true;
    let previousTime = runStart;
    let previousSegment = currentSegment;
    let time = runStart;
    while (true) {
      const elapsed = time - runStart;
      const nextSegment = segments.find(segment => elapsed < segment.endMs) || segments[segments.length - 1];
      if (nextSegment !== previousSegment) {
        if (previousSegment.phase === 'checkpoint') checkpoints.push(snapshot());
        previousSegment = nextSegment;
      }
      currentSegment = nextSegment;
      const fraction = Math.max(0, Math.min(1, (elapsed - currentSegment.startMs) / (currentSegment.endMs - currentSegment.startMs)));
      scrollToBeatPosition(currentSegment.from + (currentSegment.to - currentSegment.from) * fraction);
      if (elapsed >= durationMs) break;
      const priorSegmentId = currentSegment.id;
      const priorPhase = currentSegment.phase;
      time = await nextFrame();
      pollGpuQueries();
      if (document.hidden) throw new Error('Benchmark tab became hidden during replay.');
      if (innerWidth !== initialViewport.width || innerHeight !== initialViewport.height) throw new Error('Viewport changed during replay.');
      if (root.dataset.renderer !== profile || root.dataset.sceneState !== 'ready') throw new Error('Renderer changed or scene stopped being ready during replay.');
      const upcomingSegment = segments.find(segment => time - runStart < segment.endMs) || segments[segments.length - 1];
      const sameSegment = upcomingSegment.id === priorSegmentId;
      rafSamples.push({ duration: time - previousTime, phase: sameSegment ? priorPhase : 'boundary', segment: sameSegment ? priorSegmentId : null });
      previousTime = time;
    }
    runEnd = performance.now();
    measuring = false;
    for (const context of pendingFrames.keys()) finishFrame(context);
    if (observer) for (const entry of observer.takeRecords()) longTasks.push({ startTime: entry.startTime, duration: entry.duration });
    const finalSnapshot = snapshot();
    const sceneFrames = frames.filter(frame => frame.canvas === 'scene');
    const fieldFrames = frames.filter(frame => frame.canvas === 'field');
    const primaryFrames = profile === 'mobile' ? fieldFrames : sceneFrames;
    if (!primaryFrames.length) throw new Error(`No ${profile} primary canvas (#${primaryCanvas.id}) draw submissions were observed; this is not a valid rendering sample.`);
    const inWindowLongTasks = longTasks.filter(task => task.startTime >= runStart && task.startTime < runEnd);
    const renderCountEnd = Number(sceneCanvas.dataset.renderCount) || null;
    // Finish at most two native RAFs after measurement; never flush/finish the GPU.
    pollGpuQueries();
    for (let drain = 0; drain < 2 && pendingGpuQueries(); drain++) {
      await nextFrame();
      pollGpuQueries();
    }
    return {
      schema: 'neural-render-benchmark-v1',
      label: String(options.label || '').slice(0, 100),
      url: location.origin + location.pathname,
      profile,
      primaryCanvasId: primaryCanvas.id,
      gpuTiming: { ...gpuTiming, pendingAtEnd: pendingGpuQueries() },
      viewport: initialViewport,
      timing: { requestedDurationMs: durationMs, measuredDurationMs: round(runEnd - runStart), readingHold, scrollSpeed, openingLength, endingLength, beats, scrollUnitPx: round(unit) },
      readiness: {
        sceneReadyAtInvocation,
        waitAfterInvocationMs: round(readinessWaitMs),
        observedSceneReadyFromNavigationMs: round(observedReadyTime),
        observationDelayFromInvocationMs: observedReadyTime == null ? null : round(observedReadyTime - invocationTime),
        note: 'Scene readiness is observed by RAF polling. Already-ready pages have no measured scene first-frame time. This is not first contentful paint.',
      },
      scene: {
        all: summarizeFrames(sceneFrames),
        replayTravel: summarizeFrames(sceneFrames.filter(frame => frame.phase === 'travel'), true),
        replayCheckpoints: summarizeFrames(sceneFrames.filter(frame => frame.phase === 'checkpoint'), true),
        appRenderCountDelta: renderCountStart !== null && renderCountEnd !== null ? renderCountEnd - renderCountStart : null,
      },
      field: {
        ...summarizeFrames(fieldFrames),
        replayTravel: summarizeFrames(fieldFrames.filter(frame => frame.phase === 'travel'), true),
        replayCheckpoints: summarizeFrames(fieldFrames.filter(frame => frame.phase === 'checkpoint'), true),
      },
      rafIntervalMs: {
        all: stats(rafSamples.map(sample => sample.duration)),
        replayTravel: stats(rafSamples.filter(sample => sample.phase === 'travel').map(sample => sample.duration)),
        replayCheckpoints: stats(rafSamples.filter(sample => sample.phase === 'checkpoint').map(sample => sample.duration)),
      },
      longTasks: {
        supported: Boolean(observer), count: inWindowLongTasks.length,
        durationMs: stats(inWindowLongTasks.map(task => task.duration)),
        totalDurationMs: round(inWindowLongTasks.reduce((sum, task) => sum + task.duration, 0)),
        totalBlockingTimeMs: round(inWindowLongTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0)),
      },
      checkpoints,
      finalSnapshot,
      errors,
      limitations: [
        'Submission envelope is CPU wall time from canvas clear through the last drawing API return, including intervening JavaScript and wrapper overhead. It excludes work before clear and after the last draw.',
        'WebGL and Canvas2D APIs can queue GPU work. Submission intervals and RAF intervals are not GPU completion times or presented FPS.',
        'Optional WebGL2 timer queries measure elapsed GPU time from clear through the frame end marker. They do not measure browser compositing or presented FPS; compare runs with matching gpuTiming settings.',
        'Replay travel/checkpoint labels describe commanded scrolling; renderer easing can continue into a checkpoint. Desktop app renderMode tags are additionally counted where available.',
        'Desktop ambient is intentionally around 20 Hz; mobile ambient 18 Hz and travel 30 Hz. Compare matched profiles and travel intervals separately.',
        'Mobile browser emulation and CPU throttling do not establish performance on physical phones.',
      ],
    };
  } finally {
    measuring = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (watchdog !== null) clearTimeout(watchdog);
    for (const context of pendingFrames.keys()) finishFrame(context);
    for (const state of gpuContexts.values()) {
      for (const record of state.pending) deleteGpuQuery(state, record);
      state.pending.length = 0;
    }
    observer?.disconnect();
    window.removeEventListener('error', recordError);
    window.removeEventListener('unhandledrejection', recordError);
    for (const restore of restorers.reverse()) restore();
    window.scrollTo({ ...originalScroll, behavior: 'instant' });
  }
}
