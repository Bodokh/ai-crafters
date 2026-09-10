const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const FRAME_INTERVAL = 1000 / 24;

function randomSource() {
  let seed = 672019;
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** A distant, continuously breathing 2D neural field, independent of camera stops. */
export function createNeuralField({ canvas }) {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    return { setProgress() {}, setActivity() {}, setPaused() {}, resize() {}, dispose() {} };
  }

  // Two tiny cached sprites share the logo's cyan and violet light palette.
  const tones = [
    { glow: ['210,252,255', '121,232,255', '68,196,237', '46,142,214'], trail: '#51c9f2', core: '#93eaff', node: '#7dcced', flare: '#d6fbff' },
    { glow: ['240,232,255', '196,169,255', '139,92,246', '114,76,200'], trail: '#8b5cf6', core: '#c4b5fd', node: '#ae98e7', flare: '#eee6ff' },
  ];
  const glows = tones.map(tone => {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const spriteContext = sprite.getContext('2d');
    if (!spriteContext) return sprite;
    const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${tone.glow[0]},1)`);
    gradient.addColorStop(0.1, `rgba(${tone.glow[1]},.86)`);
    gradient.addColorStop(0.3, `rgba(${tone.glow[2]},.32)`);
    gradient.addColorStop(0.64, `rgba(${tone.glow[3]},.09)`);
    gradient.addColorStop(1, `rgba(${tone.glow[3]},0)`);
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, 64, 64);
    return sprite;
  });

  let nodes = [];
  let edges = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let mobile = false;
  let disposed = false;
  let paused = false;
  let timer = 0;
  let frame = 0;
  let lastTime = 0;
  let nextFrameAt = 0;
  let elapsed = 0;
  let activity = 0;
  let travel = 0;
  let targetTravel = 0;
  let frames = 0;

  function buildNetwork() {
    const random = randomSource();
    const count = mobile ? 55 : 85;
    const columns = Math.max(4, Math.round(Math.sqrt(count * width / height)));
    const rows = Math.ceil(count / columns);
    const gapX = (width + 100) / Math.max(1, columns - 1);
    const gapY = (height + 100) / Math.max(1, rows - 1);
    nodes = Array.from({ length: count }, (_, i) => ({
      baseX: -50 + (i % columns) * gapX + (random() - 0.5) * gapX * 0.76,
      baseY: -50 + Math.floor(i / columns) * gapY + (random() - 0.5) * gapY * 0.72,
      phase: random() * Math.PI * 2,
      depth: 0.48 + random() * 0.52,
      radius: 0.75 + random() * 0.95,
      tone: i % 3 === 1 ? 1 : 0,
      flare: 0,
      x: 0,
      y: 0,
    }));

    const seen = new Set();
    edges = [];
    for (let i = 0; i < nodes.length; i++) {
      const source = nodes[i];
      const nearest = nodes.map((node, index) => ({
        index,
        distance: Math.hypot(source.baseX - node.baseX, source.baseY - node.baseY),
      })).filter(({ index }) => index !== i).sort((a, b) => a.distance - b.distance);
      for (const candidate of nearest.slice(0, i % 4 === 0 ? 4 : 3)) {
        const key = `${Math.min(i, candidate.index)}:${Math.max(i, candidate.index)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({
          from: i,
          to: candidate.index,
          depth: Math.min(source.depth, nodes[candidate.index].depth),
          phase: random(),
          speed: 0.075 + random() * 0.08,
          signal: random(),
          pulse: random(),
          tone: source.tone,
        });
      }
    }
  }

  function stampGlow(x, y, diameter, alpha, tone) {
    context.globalAlpha = clamp(alpha);
    context.drawImage(glows[tone], x - diameter / 2, y - diameter / 2, diameter, diameter);
  }

  function draw(delta = 0) {
    elapsed += delta;
    activity *= Math.exp(-delta * 1.45);
    travel += (targetTravel - travel) * (delta ? 1 - Math.exp(-delta * 2.5) : 1);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    // Approach the distant plane: connections spread outward and glows grow gently.
    const approach = 1 + travel * (mobile ? .45 : .6);
    context.setTransform(dpr * approach, 0, 0, dpr * approach,
      width * .5 * dpr * (1 - approach), height * .5 * dpr * (1 - approach));
    context.lineCap = 'round';

    // A shared, shallow drift keeps the entire network on a distant plane.
    const driftX = Math.sin(travel * 4.6) * Math.min(24, width * .016);
    const driftY = -travel * Math.min(18, height * .018);
    for (const node of nodes) {
      const displacement = mobile ? 2 : 3;
      node.x = node.baseX + Math.sin(elapsed * 0.12 + node.phase) * displacement
        + driftX * node.depth;
      node.y = node.baseY + Math.cos(elapsed * 0.1 + node.phase * 1.4) * displacement
        + driftY * node.depth;
      node.flare *= Math.exp(-delta * 2.1);
    }

    // Batch fine structural connections by depth. They remain visible at idle.
    context.globalAlpha = 1;
    for (let layer = 0; layer < 3; layer++) {
      context.beginPath();
      for (const edge of edges) {
        if (Math.min(2, Math.floor((edge.depth - 0.48) / 0.18)) !== layer) continue;
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
      }
      context.lineWidth = 0.62 + layer * 0.12;
      const color = layer === 0 ? '139,112,198' : '86,174,207';
      context.strokeStyle = `rgba(${color},${0.16 + layer * 0.04 + activity * 0.055})`;
      context.stroke();
    }

    context.globalCompositeOperation = 'lighter';
    for (const edge of edges) {
      // A stable subset fires at idle; scrolling recruits additional pathways.
      const recruited = clamp((0.31 + activity * 0.42 - edge.signal) * 8);
      const previous = edge.pulse;
      edge.pulse = (edge.pulse + delta * edge.speed * (1 + activity * 1.55)) % 1;
      if (recruited <= 0) continue;
      const from = nodes[edge.from];
      const to = nodes[edge.to];
      if (edge.pulse < previous) to.flare = Math.max(to.flare, recruited);
      const pulse = edge.pulse;
      const fade = Math.sin(pulse * Math.PI) ** 0.45;
      const strength = recruited * fade * (0.65 + activity * 0.35);
      const tone = tones[edge.tone];
      const start = Math.max(0, pulse - 0.12 - activity * 0.06);
      const endX = from.x + (to.x - from.x) * pulse;
      const endY = from.y + (to.y - from.y) * pulse;

      // Broad low-opacity trail plus a fine luminous core, without shadowBlur.
      context.globalAlpha = strength * 0.16;
      context.strokeStyle = tone.trail;
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(from.x + (to.x - from.x) * start, from.y + (to.y - from.y) * start);
      context.lineTo(endX, endY);
      context.stroke();
      context.globalAlpha = strength * 0.78;
      context.lineWidth = 1.05;
      context.strokeStyle = tone.core;
      context.stroke();
      stampGlow(endX, endY, 20 + activity * 8, strength * 0.62, edge.tone);
    }

    for (const node of nodes) {
      const breath = 0.5 + 0.5 * Math.sin(elapsed * 0.75 + node.phase);
      const strength = 0.31 + breath * 0.2 + node.flare * 0.5 + activity * 0.14;
      stampGlow(node.x, node.y, 16 + node.flare * 24 + node.depth * 5, strength * node.depth, node.tone);
      context.globalAlpha = clamp(strength + node.flare * 0.2);
      context.fillStyle = node.flare > 0.35 ? tones[node.tone].flare : tones[node.tone].node;
      context.beginPath();
      context.arc(node.x, node.y, node.radius + node.flare * 0.8, 0, Math.PI * 2);
      context.fill();
    }
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    canvas.dataset.fieldFrames = String(++frames);
    canvas.dataset.fieldEnergy = activity.toFixed(3);
    canvas.dataset.fieldNodes = String(nodes.length);
    canvas.dataset.fieldEdges = String(edges.length);
    canvas.dataset.fieldTravel = travel.toFixed(4);
    canvas.dataset.fieldScale = approach.toFixed(4);
    canvas.dataset.fieldDriftX = driftX.toFixed(2);
    canvas.dataset.fieldDriftY = driftY.toFixed(2);
  }

  function stop() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
    lastTime = nextFrameAt = 0;
  }

  function canAnimate() {
    return !disposed && !paused && !document.hidden;
  }

  function schedule() {
    if (!canAnimate() || timer || frame) return;
    const now = performance.now();
    if (!nextFrameAt || nextFrameAt < now - FRAME_INTERVAL) nextFrameAt = now;
    timer = window.setTimeout(() => {
      timer = 0;
      if (canAnimate()) frame = requestAnimationFrame(tick);
    }, Math.max(0, nextFrameAt - now - 3));
  }

  function tick(now) {
    frame = 0;
    if (!canAnimate()) return;
    const delta = lastTime ? Math.min(0.1, Math.max(0, (now - lastTime) / 1000)) : 0;
    lastTime = now;
    draw(delta);
    nextFrameAt += FRAME_INTERVAL;
    schedule();
  }

  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width || window.innerWidth);
    height = Math.max(1, bounds.height || window.innerHeight);
    mobile = width < 700;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    buildNetwork();
    draw();
    schedule();
  }

  function visibilityChanged() {
    if (document.hidden) stop();
    else schedule();
  }

  document.addEventListener('visibilitychange', visibilityChanged);
  resize();

  return {
    setProgress(value) {
      if (!disposed && Number.isFinite(value)) targetTravel = clamp(value);
    },
    setActivity(value) {
      if (!disposed && Number.isFinite(value)) activity = Math.max(activity, clamp(value));
    },
    setPaused(value) {
      if (disposed) return;
      paused = Boolean(value);
      if (paused) stop();
      else schedule();
    },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', visibilityChanged);
      context.clearRect(0, 0, canvas.width, canvas.height);
      nodes = [];
      edges = [];
      for (const glow of glows) glow.width = glow.height = 1;
    },
  };
}
