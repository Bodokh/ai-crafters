import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

// Run the real controller with deterministic browser boundaries. Renderer imports
// stay stubbed so these checks neither launch a browser nor initialize WebGL.
const source = (await readFile(new URL('../src/main.js', import.meta.url), 'utf8'))
  .replace(/^import[^\n]+;$/gm, '')
  .replace(/import\.meta\.env\.VITE_RECAPTCHA_SITE_KEY/g, 'undefined')
  .replace(/\bimport\(/g, 'loadModule(');
const bootstrap = (await readFile(new URL('../index.html', import.meta.url), 'utf8')).match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
assert.ok(bootstrap, 'the first-paint bootstrap must be present');

class Events {
  listeners = new Map();
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) || new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
  emit(name, properties = {}) {
    for (const callback of this.listeners.get(name) || []) callback({ type: name, ...properties });
  }
}

class Element extends Events {
  constructor(dataset = {}) {
    super();
    this.dataset = dataset;
    this.attributes = new Map();
    this.style = { setProperty(name, value) { this[name] = value; }, getPropertyValue(name) { return this[name] || ''; }, removeProperty(name) { delete this[name]; } };
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) { force ? classes.add(name) : classes.delete(name); return force; },
    };
    this.inert = false;
    this.hidden = false;
    this.heading = { focus() {} };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  querySelector(selector) { return selector === '.story-beat' ? this.firstBeat : this.heading; }
  closest(selector) { return selector === '.chapter' ? this.chapter : null; }
  getBoundingClientRect() { return { top: 0, bottom: 800, width: 390, height: 800 }; }
  scrollIntoView() { this.scrolledIntoView = true; }
  contains() { return false; }
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function harness({ width = 390, height = 844, stageHeight = 764, coarse = true,
  screenWidth = width, screenHeight = height, reduced = false, deferredMobile = false } = {}) {
  const root = new Element();
  root.lang = 'en';
  const journey = new Element();
  const stage = new Element();
  const canvas = new Element();
  const fieldCanvas = new Element();
  const curtain = new Element();
  const progress = new Element();
  const motionToggle = new Element();
  const chapters = ['start', 'knowledge', 'agents', 'results', 'process', 'team', 'faq', 'contact'].map(id => {
    const chapter = new Element(); chapter.id = id; return chapter;
  });
  const starts = [0, 1, 3, 7, 10, 13, 15, 18];
  const beats = Array.from({ length: 19 }, (_, index) => {
    const beat = new Element({ key: index === 14 ? 'trust' : index === 18 ? 'contact' : `beat-${index}`, side: index % 2 ? 'right' : 'left' });
    const chapterIndex = starts.findLastIndex(start => start <= index);
    beat.chapter = chapters[chapterIndex];
    if (starts[chapterIndex] === index) beat.chapter.firstBeat = beat;
    return beat;
  });
  const nav = chapters.map(chapter => { const link = new Element(); link.hash = `#${chapter.id}`; return link; });
  const elements = new Map([
    ['.journey', journey], ['.journey-stage', stage], ['#neural-canvas', canvas], ['#neural-field', fieldCanvas],
    ['.journey-curtain', curtain], ['.journey-progress > span', progress], ['.contact-content', new Element()],
    ['.current-checkpoint', new Element()], ['[data-motion-toggle]', motionToggle], ['.mobile-menu', new Element()],
    ['[data-beat-counter]', new Element()], ['[data-next-beat]', new Element()], ['[data-previous-beat]', new Element()],
  ]);
  const document = Object.assign(new Events(), {
    documentElement: root, hidden: false,
    querySelector: selector => elements.get(selector) || null,
    querySelectorAll: selector => ({ '.chapter': chapters, '.story-beat': beats, '.chapter-nav a': nav }[selector] || []),
  });
  const window = new Events();
  let currentStageHeight = stageHeight;
  let currentCoarse = coarse;
  let currentReduced = reduced;
  let timerId = 0;
  const timers = new Map();
  const frames = new Map();
  const scrollCalls = [];
  const imports = [];
  const renderers = [];
  const factories = [];
  const contextRequests = [];
  const media = new Map();
  const pendingMobile = deferred();
  const cards = { updates: [], update(...args) { this.updates.push(args); }, setEnabled() {}, setLightweight() {}, dispose() {} };
  const testimonials = { update() {}, dispose() {} };
  const sandbox = {
    document, window, innerWidth: width, innerHeight: height, scrollY: 0,
    screen: { width: screenWidth, height: screenHeight },
    location: { hash: '', pathname: '/' }, history: { pushState(_state, _title, hash) { sandbox.location.hash = hash; } },
    performance: { now: () => 100 }, console: { warn() {} }, AbortController,
    initializeLocalization: () => ({ chapterNames: chapters.map(chapter => chapter.id), motionLabels: { pause: 'Pause motion', resume: 'Resume motion' } }),
    createCardMotion: () => cards, createTestimonials: () => testimonials, createContactDialog: () => ({ dispose() {} }),
    matchMedia(query) {
      if (!media.has(query)) {
        const result = new Events();
        Object.defineProperty(result, 'matches', { get: () => {
          if (query.includes('prefers-reduced-motion')) return currentReduced;
          if (query.includes('pointer: coarse')) return currentCoarse;
          if (query.includes('pointer: fine')) return !currentCoarse;
          if (query.includes('max-height: 500px')) return sandbox.innerHeight <= 500;
          if (query.includes('max-width')) return sandbox.innerWidth <= Number(query.match(/max-width:\s*(\d+)/)?.[1]);
          return false;
        } });
        media.set(query, result);
      }
      return media.get(query);
    },
    setTimeout(callback, delay = 0) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(callback) { const id = ++timerId; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    IntersectionObserver: class { observe() {} disconnect() {} },
    getComputedStyle: element => ({ height: `${element === stage ? currentStageHeight : height}px` }),
    loadModule(name) {
      imports.push(name);
      if (name === './scene.js') return Promise.resolve({ createNeuralScene: options => createRenderer('desktop', options) });
      if (name === './field.js') return Promise.resolve({ createNeuralField: options => createRenderer('field', options) });
      if (name === './mobile-scene.js') return Promise.resolve({ createMobileNeuralScene: options => {
        const renderer = createRenderer('mobile', options);
        return deferredMobile ? pendingMobile.promise.then(() => renderer) : renderer;
      } });
      throw new Error(`Unexpected renderer import: ${name}`);
    },
  };
  function createRenderer(kind, options) {
    const renderer = {
      kind, options, progress: [], pauseStates: [], resizeCount: 0, disposeCount: 0,
      setProgress(value) { this.progress.push(value); }, setTravel(value) { this.travel = value; },
      setActivity(value) { this.activity = value; }, setPaused(value) { this.pauseStates.push(value); },
      resize() { this.resizeCount++; }, dispose() { this.disposeCount++; },
    };
    factories.push({ kind, options });
    renderers.push(renderer);
    return renderer;
  }
  canvas.getContext = kind => { contextRequests.push({ canvas: 'webgl', kind }); throw new Error('Controller must not initialize WebGL'); };
  fieldCanvas.getContext = kind => { contextRequests.push({ canvas: 'field', kind }); return {}; };
  journey.getBoundingClientRect = () => ({ top: -sandbox.scrollY, bottom: 30000 - sandbox.scrollY, height: 30000, width: sandbox.innerWidth });
  stage.getBoundingClientRect = () => ({ top: 0, bottom: currentStageHeight, height: currentStageHeight, width: sandbox.innerWidth });
  Object.defineProperty(stage, 'clientHeight', { get: () => currentStageHeight });
  Object.defineProperty(stage, 'offsetHeight', { get: () => currentStageHeight });
  window.scrollTo = options => { scrollCalls.push(options); sandbox.scrollY = options.top; };
  Object.defineProperties(window, {
    screen: { get: () => sandbox.screen }, innerHeight: { get: () => sandbox.innerHeight }, innerWidth: { get: () => sandbox.innerWidth },
  });
  const context = vm.createContext(sandbox);
  vm.runInContext(bootstrap, context, { filename: 'homepage-bootstrap.js' });
  const firstPaint = { renderer: root.dataset.renderer, enhanced: root.classList.contains('is-enhanced') };
  vm.runInContext(source, context, { filename: new URL('../src/main.js', import.meta.url).href });
  async function settle() {
    for (let cycle = 0; cycle < 10; cycle++) {
      for (const [id, timer] of [...timers]) if (timer.delay === 0) { timers.delete(id); timer.callback(); }
      await Promise.resolve();
      for (const [id, callback] of [...frames]) { frames.delete(id); callback(100); }
    }
  }
  return {
    root, document, window, beats, stage, canvas, fieldCanvas, curtain, progress, firstPaint, imports, renderers, factories, contextRequests, scrollCalls, sandbox,
    settle, pendingMobile,
    scroll(top) { sandbox.scrollY = top; window.emit('scroll'); },
    resize({ width = sandbox.innerWidth, height = sandbox.innerHeight, stageHeight = currentStageHeight,
      coarse = currentCoarse, screenWidth = sandbox.screen.width, screenHeight = sandbox.screen.height } = {}) {
      const prior = new Map([...media].map(([query, result]) => [query, result.matches]));
      sandbox.innerWidth = width; sandbox.innerHeight = height; currentStageHeight = stageHeight; currentCoarse = coarse;
      sandbox.screen.width = screenWidth; sandbox.screen.height = screenHeight;
      for (const [query, result] of media) if (prior.get(query) !== result.matches) result.emit('change', { matches: result.matches });
      window.emit('resize');
    },
    setReduced(value) {
      currentReduced = value;
      for (const [query, result] of media) if (query.includes('prefers-reduced-motion')) result.emit('change', { matches: value });
    },
  };
}

for (const [name, options, expected] of [
  ['phone', {}, 'mobile'],
  ['portrait tablet', { width: 834, height: 1194, stageHeight: 1100 }, 'mobile'],
  ['landscape tablet', { width: 1024, height: 768, stageHeight: 700 }, 'mobile'],
  ['narrow desktop window', { width: 640, coarse: false }, 'desktop'],
  ['wide desktop', { width: 1440, height: 900, coarse: false }, 'desktop'],
  ['large touch display', { width: 1440, height: 1000 }, 'desktop'],
]) {
  test(`${name} loads only its ${expected} renderer`, async () => {
    const app = harness(options);
    await app.settle();
    assert.equal(app.firstPaint.renderer, expected, 'first-paint CSS and runtime must use the same profile');
    assert.equal(app.root.dataset.renderer, expected);
    assert.deepEqual(app.imports.sort(), expected === 'mobile' ? ['./mobile-scene.js'] : ['./field.js', './scene.js']);
    assert.equal(app.contextRequests.length, 0);
    if (expected === 'mobile') assert.equal(app.factories[0].options.canvas, app.fieldCanvas);
    else assert.equal(app.factories.find(factory => factory.kind === 'desktop').options.canvas, app.canvas);
  });
}

test('a mobile renderer starts paused behind black and resumes after scrolling', async () => {
  const app = harness();
  await app.settle();
  const renderer = app.renderers[0];
  assert.equal(renderer.kind, 'mobile');
  assert.equal(renderer.options.initiallyPaused, true);
  assert.equal(renderer.pauseStates.at(-1), true);
  assert.equal(app.curtain.style.opacity, '1.0000');
  app.scroll(2000);
  await app.settle();
  assert.equal(renderer.pauseStates.at(-1), false);
  assert.ok(renderer.progress.at(-1) > 0);
  assert.equal(app.progress.style.transform, `scaleX(${app.root.dataset.progress})`);
  assert.equal(app.curtain.style.opacity, '0.0000');
  renderer.options.onReady();
  assert.equal(app.root.dataset.sceneState, 'ready');
});

test('mobile scrolling uses the stable stage height instead of the address bar viewport', async () => {
  const app = harness({ height: 844, stageHeight: 764 });
  await app.settle();
  app.scroll(4000);
  await app.settle();
  const before = { progress: app.root.dataset.progress, scroll: app.sandbox.scrollY, calls: app.scrollCalls.length,
    resizeCount: app.renderers[0].resizeCount, journeyHeight: app.root.style['--journey-height'] };
  app.resize({ height: 744 });
  await app.settle();
  assert.equal(app.root.dataset.progress, before.progress);
  assert.equal(app.sandbox.scrollY, before.scroll);
  assert.equal(app.scrollCalls.length, before.calls, 'address bar resizing must not programmatically move the page');
  assert.equal(app.renderers[0].resizeCount, before.resizeCount, 'unchanged stage does not need a canvas resize');
  assert.equal(app.root.style['--journey-height'], before.journeyHeight);
});

test('a real mobile stage resize preserves the fractional journey position', async () => {
  const app = harness();
  await app.settle();
  app.scroll(4000);
  await app.settle();
  const progress = app.root.dataset.progress;
  app.resize({ width: 430, height: 932, stageHeight: 852 });
  await app.settle();
  assert.equal(app.root.dataset.progress, progress);
  assert.ok(app.renderers[0].resizeCount > 0);
});

test('switching renderer profiles keeps the current scroll journey and disposes the old renderer', async () => {
  const app = harness();
  await app.settle();
  app.scroll(6000);
  await app.settle();
  const progress = app.root.dataset.progress;
  const beat = app.root.dataset.beat;
  const firstRenderer = app.renderers[0];
  app.resize({ width: 1440, height: 900, coarse: false, stageHeight: 900 });
  await app.settle();
  assert.equal(app.root.dataset.renderer, 'desktop');
  assert.equal(firstRenderer.disposeCount, 1);
  assert.equal(firstRenderer.options.signal.aborted, true);
  assert.equal(app.root.dataset.progress, progress);
  assert.equal(app.root.dataset.beat, beat);
  assert.equal(app.beats.some(beat => beat.scrolledIntoView), false, 'profile changes must not reset through the static layout');
  const desktop = app.renderers.find(renderer => renderer.kind === 'desktop');
  assert.equal(desktop.progress.at(-1).toFixed(5), progress);
});

test('late renderer readiness and failure cannot overwrite a newer profile', async () => {
  const app = harness({ deferredMobile: true });
  await app.settle();
  const old = app.renderers[0];
  app.resize({ width: 1440, height: 900, coarse: false, stageHeight: 900 });
  await app.settle();
  const expected = app.root.dataset.sceneState;
  assert.equal(old.options.signal.aborted, true);
  old.options.onReady();
  old.options.onError(new Error('obsolete renderer failure'));
  assert.equal(app.root.dataset.sceneState, expected);
  assert.equal(app.root.dataset.renderer, 'desktop');
  assert.equal(app.root.classList.contains('is-enhanced'), true);
  app.pendingMobile.resolve();
  await app.settle();
  assert.equal(old.disposeCount, 1);
  assert.equal(app.root.dataset.renderer, 'desktop');
});

test('unloading during renderer construction aborts it and ignores late callbacks', async () => {
  const app = harness({ deferredMobile: true });
  await app.settle();
  const renderer = app.renderers[0];
  app.window.emit('pagehide', { persisted: false });
  assert.equal(renderer.options.signal.aborted, true);
  renderer.options.onReady();
  renderer.options.onError(new Error('obsolete renderer failure'));
  app.pendingMobile.resolve();
  await app.settle();
  assert.equal(renderer.disposeCount, 1);
  assert.equal(app.root.dataset.sceneState, 'static');
  assert.equal(app.root.classList.contains('is-enhanced'), false);
});

test('a current renderer failure exposes readable static content', async () => {
  const app = harness();
  await app.settle();
  app.renderers[0].options.onError(new Error('canvas unavailable'));
  assert.equal(app.root.dataset.sceneState, 'static');
  assert.equal(app.root.classList.contains('is-enhanced'), false);
  assert.ok(app.beats.every(beat => !beat.inert && beat.getAttribute('aria-hidden') === null));
});

for (const [name, options] of [['reduced motion', { reduced: true }], ['short viewport', { height: 500 }]]) {
  test(`${name} keeps static content without importing a renderer`, async () => {
    const app = harness(options);
    await app.settle();
    assert.deepEqual(app.imports, []);
    assert.equal(app.root.dataset.sceneState, 'static');
    assert.equal(app.root.classList.contains('is-enhanced'), false);
    assert.equal(app.firstPaint.enhanced, false);
    assert.ok(app.beats.every(beat => !beat.inert));
  });
}

test('reduced motion changes dispose the renderer and can restore the current checkpoint', async () => {
  const app = harness();
  await app.settle();
  app.scroll(6000);
  await app.settle();
  const beat = app.root.dataset.beat;
  const old = app.renderers[0];
  app.setReduced(true);
  assert.equal(old.disposeCount, 1);
  assert.equal(app.root.dataset.sceneState, 'static');
  app.setReduced(false);
  await app.settle();
  assert.equal(app.root.dataset.beat, beat);
  assert.equal(app.root.dataset.renderer, 'mobile');
});

async function checkpointSpacing(app) {
  app.document.querySelector('[data-next-beat]').emit('click');
  app.window.emit('scroll');
  await app.settle();
  const first = app.sandbox.scrollY;
  app.document.querySelector('[data-next-beat]').emit('click');
  app.window.emit('scroll');
  await app.settle();
  return app.sandbox.scrollY - first;
}

test('mobile checkpoints require less scrolling while their reading pause is longer', async () => {
  const viewport = { width: 640, height: 800, stageHeight: 800 };
  const mobile = harness(viewport);
  const desktop = harness({ ...viewport, coarse: false });
  await mobile.settle();
  await desktop.settle();
  const mobileSpacing = await checkpointSpacing(mobile);
  const desktopSpacing = await checkpointSpacing(desktop);
  assert.ok(Math.abs(mobileSpacing / desktopSpacing - .8) < 1e-10, 'mobile is 25% faster between checkpoints');
  assert.ok(.4 * mobileSpacing > .2 * desktopSpacing, 'the mobile reading pause still spans more physical scrolling than before');

  const arrival = mobile.sandbox.scrollY - .2 * mobileSpacing;
  mobile.scroll(arrival);
  await mobile.settle();
  const progress = mobile.root.dataset.progress;
  for (const phase of [.1, .2, .399]) {
    mobile.scroll(arrival + phase * mobileSpacing);
    await mobile.settle();
    assert.equal(mobile.root.dataset.progress, progress, `the mobile card stays settled at ${phase * 100}% of the checkpoint`);
  }
  mobile.scroll(arrival + .5 * mobileSpacing);
  await mobile.settle();
  assert.ok(Number(mobile.root.dataset.progress) > Number(progress), 'travel resumes after the longer pause');
});

test('desktop keeps its original checkpoint distance and 20% reading pause', async () => {
  const app = harness({ width: 1440, height: 900, stageHeight: 900, coarse: false });
  await app.settle();
  const spacing = await checkpointSpacing(app);
  assert.ok(Math.abs(spacing - 900 * 1.6 / 1.35) < 1e-10);
  const arrival = app.sandbox.scrollY - .1 * spacing;
  app.scroll(arrival);
  await app.settle();
  const settled = app.root.dataset.progress;
  app.scroll(arrival + .199 * spacing);
  await app.settle();
  assert.equal(app.root.dataset.progress, settled);
  app.scroll(arrival + .3 * spacing);
  await app.settle();
  assert.ok(Number(app.root.dataset.progress) > Number(settled));
  app.scroll(arrival + .6 * spacing);
  await app.settle();
  assert.equal(app.root.dataset.progress, (2.5 / 18).toFixed(5), 'desktop still reaches the midpoint halfway through its original travel phase');
});

for (const coarse of [true, false]) {
  for (const [phaseName, checkpoint, phase] of [
    ['reading pause', 2, coarse ? .2 : .1],
    ['travel', 2, coarse ? .7 : .6],
    ['final arrival', 17, coarse ? .7 : .6],
    ['completed ending', 18, coarse ? .55 : .35],
  ]) {
    test(`${coarse ? 'mobile to desktop' : 'desktop to mobile'} preserves the ${phaseName} pose`, async () => {
      const app = harness({ width: 640, height: 800, stageHeight: 800, coarse });
      await app.settle();
      const spacing = await checkpointSpacing(app);
      app.scroll((.5 + checkpoint + phase) * spacing);
      await app.settle();
      const before = {
        progress: app.root.dataset.progress,
        beat: app.root.dataset.beat,
        opacity: app.beats.map(beat => beat.style[coarse ? 'opacity' : '--beat-opacity']),
      };
      app.resize({ coarse: !coarse });
      await app.settle();
      assert.equal(app.root.dataset.progress, before.progress);
      assert.equal(app.root.dataset.beat, before.beat);
      assert.deepEqual(app.beats.map(beat => beat.style[coarse ? '--beat-opacity' : 'opacity']), before.opacity);
      if (phaseName === 'completed ending') {
        const nextSpacing = spacing * (coarse ? 1.25 : .8);
        const nextHold = coarse ? .2 : .4;
        const endingTail = app.sandbox.scrollY / nextSpacing - .5 - checkpoint - nextHold;
        assert.ok(Math.abs(endingTail - .15) < 1e-10, 'the remaining ending distance survives the profile switch even after progress reaches 100%');
      }
      const scroll = app.sandbox.scrollY;
      app.resize();
      await app.settle();
      assert.equal(app.root.dataset.progress, before.progress, 'a follow-up resize must not reapply profile retiming');
      assert.equal(app.sandbox.scrollY, scroll);
    });
  }
}
