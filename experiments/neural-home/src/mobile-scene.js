import { upgradeMobileNeuronSprites } from './mobile-neuron-sprites.js';

const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const TAU = Math.PI * 2;
const AXES = ['x', 'y', 'z'];
const RGB = ['93,207,234', '157,124,217'];
const LATERAL_STOPS = [.2, 2.2, -2, 4, 3, -3, -4, 3, 3.8, -2.8, -4, 2.5, 4, -2, 3, 4, -2.7, -3, 2];

function seededRandom(seed = 981734) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** Physical checkpoint positions never depend on the document's text direction. */
export function createMobileRoute(cardSides) {
  if (!Array.isArray(cardSides) || cardSides.length < 2) {
    throw new Error('The mobile scene needs at least two story checkpoints.');
  }
  const camera = cardSides.map((_, index) => ({
    x: (LATERAL_STOPS[index % LATERAL_STOPS.length]) * .48,
    y: Math.sin(index * 1.17) * .55,
    z: index * 5.5,
  }));
  const nodes = camera.map((point, index) => ({
    x: point.x + (cardSides[index] === 'left' ? 1.75 : -1.75),
    y: point.y - .8 + Math.sin(index * 1.7) * .25,
    z: point.z + 5.2,
  }));
  return { camera, nodes };
}

/** Bounded Catmull–Rom interpolation gives the same path in either direction. */
export function sampleMobileRoute(points, position, result = {}) {
  const value = clamp(position, 0, points.length - 1);
  if (Number.isInteger(value)) {
    for (const axis of AXES) result[axis] = points[value][axis];
    return result;
  }
  const index = Math.min(points.length - 2, Math.floor(value));
  const t = value - index;
  const a = points[Math.max(0, index - 1)], b = points[index];
  const c = points[index + 1], d = points[Math.min(points.length - 1, index + 2)];
  for (const axis of AXES) {
    result[axis] = .5 * ((2 * b[axis]) + (-a[axis] + c[axis]) * t
      + (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t * t
      + (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t * t * t);
  }
  return result;
}

function createSprite(document, size, paint) {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = size;
  const context = sprite.getContext('2d', { alpha: true });
  if (!context) throw new Error('The mobile scene could not prepare its image layers.');
  paint(context, size);
  return sprite;
}

function createGlow(document, tone) {
  return createSprite(document, 96, (context, size) => {
    const radius = size / 2;
    const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, 'rgba(233,253,255,1)');
    gradient.addColorStop(.075, `rgba(${RGB[tone]},.95)`);
    gradient.addColorStop(.25, `rgba(${RGB[tone]},.3)`);
    gradient.addColorStop(.6, `rgba(${RGB[tone]},.065)`);
    gradient.addColorStop(1, `rgba(${RGB[tone]},0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  });
}

// Organic tapered dendrites and a softly lit cell body are rasterized once.
// During the journey they are only translated, scaled, and composited.
function createNeuron(document, variant) {
  return createSprite(document, 288, (context, size) => {
    const random = seededRandom(87391 + variant * 173);
    const center = size / 2;
    const tone = variant % 2;
    context.translate(center, center);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (let branch = 0; branch < 9; branch++) {
      const angle = branch / 9 * TAU + (random() - .5) * .35;
      const length = 90 + random() * 46;
      const bend = (random() - .5) * .62;
      let previousX = Math.cos(angle) * 11;
      let previousY = Math.sin(angle) * 11;
      for (let segment = 1; segment <= 6; segment++) {
        const portion = segment / 6;
        const direction = angle + bend * portion;
        const x = Math.cos(direction) * length * portion;
        const y = Math.sin(direction) * length * portion;
        context.beginPath();
        context.moveTo(previousX, previousY);
        context.lineTo(x, y);
        context.lineWidth = 9 * (1 - portion) ** 2 + .55;
        context.strokeStyle = `rgba(${RGB[tone]},${.28 - portion * .18})`;
        context.stroke();
        context.lineWidth = 1.2 * (1 - portion) + .25;
        context.strokeStyle = `rgba(${RGB[tone]},${.5 - portion * .31})`;
        context.stroke();
        if (segment === 3 || segment === 4) {
          const side = segment % 2 ? 1 : -1;
          const forkAngle = direction + side * (.4 + random() * .35);
          const forkLength = 21 + random() * 28;
          context.beginPath();
          context.moveTo(x, y);
          context.quadraticCurveTo(x + Math.cos(forkAngle) * forkLength * .5,
            y + Math.sin(forkAngle) * forkLength * .5,
            x + Math.cos(forkAngle + side * .2) * forkLength,
            y + Math.sin(forkAngle + side * .2) * forkLength);
          context.lineWidth = .65;
          context.strokeStyle = `rgba(${RGB[tone]},.22)`;
          context.stroke();
        }
        previousX = x;
        previousY = y;
      }
    }
    const soma = context.createRadialGradient(-4, -5, 1, 0, 0, 25);
    soma.addColorStop(0, `rgba(${RGB[tone]},.5)`);
    soma.addColorStop(.24, `rgba(${RGB[tone]},.25)`);
    soma.addColorStop(.66, 'rgba(14,45,66,.7)');
    soma.addColorStop(1, `rgba(${RGB[tone]},.35)`);
    context.fillStyle = soma;
    context.beginPath();
    for (let step = 0; step <= 36; step++) {
      const angle = step / 36 * TAU;
      const radius = 17 + Math.cos(angle * 5 + variant) * 2.5 + Math.sin(angle * 3) * 1.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 1.12;
      if (!step) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
    context.strokeStyle = `rgba(${RGB[tone]},.4)`;
    context.lineWidth = .7;
    context.stroke();
  });
}

/** A single inexpensive canvas preserves the journey on phones without WebGL. */
export function createMobileNeuralScene({ canvas, cardSides, signal, initiallyPaused = false,
  onReady = () => {}, onError = () => {} }) {
  if (signal?.aborted) throw new DOMException('Mobile scene loading was cancelled.', 'AbortError');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('A Canvas2D context is required for the mobile journey.');
  const document = canvas.ownerDocument;
  const window = document.defaultView;
  const route = createMobileRoute(cardSides);
  const random = seededRandom();
  const glows = [createGlow(document, 0), createGlow(document, 1)];
  const sprites = Array.from({ length: 4 }, (_, index) => createNeuron(document, index));
  const stars = Array.from({ length: 36 }, (_, index) => ({
    x: -.17 + random() * 1.34,
    y: -.16 + random() * 1.32,
    phase: random() * TAU,
    tone: index % 3 === 1 ? 1 : 0,
    xNow: 0, yNow: 0,
  }));
  const edges = [];
  for (let from = 0; from < stars.length; from++) {
    const neighbors = stars.map((star, index) => ({ index,
      distance: Math.hypot(star.x - stars[from].x, star.y - stars[from].y) }))
      .filter(candidate => candidate.index > from)
      .sort((a, b) => a.distance - b.distance).slice(0, 2);
    for (const neighbor of neighbors) {
      if (neighbor.distance < .36) edges.push({ from, to: neighbor.index, phase: random() });
    }
  }
  const scenery = route.camera.map((station, index) => ({
    x: station.x + (index % 2 ? -3.5 : 3.5),
    y: station.y + (index % 3 - 1) * 2.5,
    z: station.z + 9,
    variant: index % 4,
  }));
  let width = 1, height = 1, pixelRatio = 1;
  let quality = 1, slowFrames = 0, lastDrawCost = 0, needsResolutionUpdate = false;
  let disposed = false, ready = false, paused = Boolean(initiallyPaused);
  let cancelSpriteUpgrade = () => {};
  let frame = 0, timer = 0, lastTime = 0, nextFrameAt = 0, elapsed = 0;
  let progress = 0, targetProgress = 0, travel = 0, targetTravel = 0, activity = 0;
  let direction = 1;
  const camera = {}, routePoint = {}, head = {}, projected = {}, previous = {}, point = {};

  function stopped() { return disposed || paused || document.hidden; }
  function cancelFrame() {
    window.cancelAnimationFrame(frame);
    window.clearTimeout(timer);
    frame = timer = 0;
  }
  function schedule() {
    if (stopped() || frame || timer) return;
    const delay = nextFrameAt - window.performance.now();
    // Wake just before the due vsync, rather than waiting a whole extra frame
    // after a timer expires. The rAF timestamp still enforces the paint cadence.
    if (delay > 18) timer = window.setTimeout(() => {
      timer = 0;
      if (!stopped()) frame = window.requestAnimationFrame(tick);
    }, delay - 12);
    else frame = window.requestAnimationFrame(tick);
  }
  function wakeForTravel() {
    if (lastTime && nextFrameAt > lastTime + 1000 / 30) {
      nextFrameAt = lastTime + 1000 / 30;
      window.clearTimeout(timer);
      timer = 0;
    }
    schedule();
  }
  function updateResolution() {
    pixelRatio = Math.min(1, window.devicePixelRatio || 1) * quality;
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    needsResolutionUpdate = false;
  }
  function resize() {
    if (disposed) return;
    width = Math.max(1, canvas.clientWidth || window.innerWidth);
    height = Math.max(1, canvas.clientHeight || window.innerHeight);
    needsResolutionUpdate = true;
    schedule();
  }
  function project(position, output) {
    const distance = position.z - camera.z;
    if (distance < 1.25 || distance > 28) return false;
    const scale = width * .9 / distance;
    output.x = width * .5 + (position.x - camera.x) * scale;
    output.y = height * .45 + (position.y - camera.y) * scale;
    output.scale = scale;
    output.alpha = Math.min(1, (distance - 1.25) / 1.5) * clamp((28 - distance) / 12);
    return true;
  }
  function glow(x, y, diameter, alpha, tone = 0) {
    context.globalAlpha = clamp(alpha);
    context.drawImage(glows[tone], x - diameter / 2, y - diameter / 2, diameter, diameter);
  }
  function drawField() {
    const approach = 1 + travel * .16;
    const driftX = -camera.x * 2.6 + Math.sin(elapsed * .13) * 2;
    const driftY = -travel * 20;
    const limit = quality < .8 ? 26 : stars.length;
    for (let index = 0; index < limit; index++) {
      const star = stars[index];
      star.xNow = (star.x - .5) * width * approach + width * .5 + driftX;
      star.yNow = (star.y - .5) * height * approach + height * .5 + driftY
        + Math.sin(elapsed * .14 + star.phase) * 2;
    }
    context.globalAlpha = 1;
    context.lineWidth = .65;
    context.strokeStyle = 'rgba(108,154,183,.22)';
    context.beginPath();
    for (const edge of edges) {
      if (edge.from >= limit || edge.to >= limit) continue;
      context.moveTo(stars[edge.from].xNow, stars[edge.from].yNow);
      context.lineTo(stars[edge.to].xNow, stars[edge.to].yNow);
    }
    context.stroke();
    context.globalCompositeOperation = 'lighter';
    for (let index = 0; index < limit; index++) {
      const star = stars[index];
      const pulse = .32 + Math.sin(elapsed * .8 + star.phase) * .13;
      glow(star.xNow, star.yNow, 13, pulse, star.tone);
    }
    for (let index = 0; index < edges.length; index += 6) {
      const edge = edges[index];
      if (edge.from >= limit || edge.to >= limit) continue;
      const from = stars[edge.from], to = stars[edge.to];
      const pulse = (elapsed * .065 + edge.phase) % 1;
      const alpha = Math.sin(pulse * Math.PI) * (.45 + activity * .2);
      glow(from.xNow + (to.xNow - from.xNow) * pulse,
        from.yNow + (to.yNow - from.yNow) * pulse, 18, alpha, from.tone);
    }
    context.globalCompositeOperation = 'source-over';
  }
  function neuron(position, variant, size, alpha) {
    if (!project(position, projected)) return;
    const diameter = projected.scale * size;
    if (projected.x + diameter / 2 < 0 || projected.x - diameter / 2 > width
      || projected.y + diameter / 2 < 0 || projected.y - diameter / 2 > height) return;
    context.globalAlpha = projected.alpha * alpha;
    context.drawImage(sprites[variant], projected.x - diameter / 2, projected.y - diameter / 2, diameter, diameter);
    glow(projected.x, projected.y, diameter * .2,
      projected.alpha * alpha * (.52 + Math.sin(elapsed * .9 + position.z) * .1), variant % 2);
  }
  function drawRoute(station) {
    context.globalAlpha = .21;
    context.strokeStyle = '#6dcbe7';
    context.lineWidth = .85;
    context.beginPath();
    let connected = false;
    const start = Math.max(0, Math.floor(station) - 1);
    const end = Math.min(route.nodes.length - 1, Math.floor(station) + 3);
    for (let value = start; value <= end + .001; value += 1 / 8) {
      sampleMobileRoute(route.nodes, value, routePoint);
      if (!project(routePoint, point)) { connected = false; continue; }
      if (connected) context.lineTo(point.x, point.y);
      else context.moveTo(point.x, point.y);
      connected = true;
    }
    context.stroke();
    // Only a short fading wake is bright; the whole route never turns white.
    context.globalCompositeOperation = 'lighter';
    context.lineWidth = 1.8;
    context.strokeStyle = '#9aedff';
    for (let step = 0; step < 10; step++) {
      const from = clamp(station - direction * .22 * (1 - step / 10), 0, route.nodes.length - 1);
      const to = clamp(station - direction * .22 * (1 - (step + 1) / 10), 0, route.nodes.length - 1);
      sampleMobileRoute(route.nodes, from, routePoint);
      if (!project(routePoint, previous)) continue;
      sampleMobileRoute(route.nodes, to, routePoint);
      if (!project(routePoint, point)) continue;
      context.globalAlpha = .07 + (step / 10) ** 2 * .68;
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    }
    sampleMobileRoute(route.nodes, station, routePoint);
    if (project(routePoint, head)) {
      const breath = 1 + Math.sin(elapsed * 1.15) * .08;
      glow(head.x, head.y, 68 * breath, .83 + activity * .12);
      glow(head.x, head.y, 26 * breath, .95);
      context.globalAlpha = 1;
      context.fillStyle = '#e5fbff';
      context.beginPath();
      context.arc(head.x, head.y, 3.2 + activity * .55, 0, TAU);
      context.fill();
    }
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
  }
  function draw(delta) {
    elapsed += delta;
    activity *= Math.exp(-delta * 2.2);
    progress += (targetProgress - progress) * (1 - Math.exp(-delta * 18));
    travel += (targetTravel - travel) * (1 - Math.exp(-delta * 4));
    if (Math.abs(targetProgress - progress) < .00001) progress = targetProgress;
    const station = progress * (route.nodes.length - 1);
    sampleMobileRoute(route.camera, station, camera);
    camera.x += Math.sin(elapsed * .14) * .015;
    camera.y += Math.cos(elapsed * .12) * .015;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    drawField();
    const start = Math.max(0, Math.floor(station) - 2);
    const end = Math.min(route.nodes.length - 1, Math.floor(station) + 3);
    for (let index = end; index >= start; index--) {
      if (quality >= .8 || index % 2 === 0) neuron(scenery[index], scenery[index].variant, 7, .36);
      neuron(route.nodes[index], index % 4, 6.4, .8);
    }
    drawRoute(station);
  }
  function tick(time) {
    frame = 0;
    if (stopped()) return;
    if (time + 1 < nextFrameAt) { schedule(); return; }
    const delta = lastTime ? clamp((time - lastTime) / 1000, 0, .1) : 1 / 30;
    lastTime = time;
    try {
      if (needsResolutionUpdate) updateResolution();
      const started = window.performance.now();
      draw(delta);
      const cost = window.performance.now() - started;
      lastDrawCost = lastDrawCost * .8 + cost * .2;
      // Back off only after sustained rendering cost, never after an isolated GC.
      slowFrames = lastDrawCost > 8 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames >= 18 && quality > .72) {
        quality = quality > .85 ? .85 : .72;
        slowFrames = 0;
        needsResolutionUpdate = true;
      }
      if (!ready) {
        ready = true;
        onReady();
        if (!disposed) cancelSpriteUpgrade = upgradeMobileNeuronSprites(window, sprites);
      }
      const moving = Math.abs(targetProgress - progress) > .00003 || activity > .08;
      const interval = 1000 / (moving ? 30 : 18);
      nextFrameAt = nextFrameAt && time - nextFrameAt < interval
        ? nextFrameAt + interval : time + interval;
      schedule();
    } catch (error) {
      dispose();
      onError(error);
    }
  }
  function visibility() {
    lastTime = nextFrameAt = 0;
    if (document.hidden) cancelFrame();
    else schedule();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelSpriteUpgrade();
    cancelFrame();
    document.removeEventListener('visibilitychange', visibility);
    signal?.removeEventListener('abort', dispose);
    for (const sprite of [...glows, ...sprites]) sprite.width = sprite.height = 1;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  document.addEventListener('visibilitychange', visibility);
  signal?.addEventListener('abort', dispose, { once: true });
  resize();

  return {
    setProgress(value) {
      if (!Number.isFinite(value) || disposed) return;
      const next = clamp(value);
      if (next !== targetProgress) direction = next >= targetProgress ? 1 : -1;
      targetProgress = next;
      if (!ready || paused) progress = next;
      wakeForTravel();
    },
    setTravel(value) {
      if (!Number.isFinite(value) || disposed) return;
      targetTravel = clamp(value);
      if (!ready || paused) travel = targetTravel;
      schedule();
    },
    setActivity(value) {
      if (!Number.isFinite(value) || disposed) return;
      activity = clamp(value);
      if (activity > .08) wakeForTravel();
      else schedule();
    },
    setPaused(value) {
      if (disposed || paused === Boolean(value)) return;
      paused = Boolean(value);
      lastTime = nextFrameAt = 0;
      if (paused) cancelFrame();
      else schedule();
    },
    resize,
    dispose,
  };
}
