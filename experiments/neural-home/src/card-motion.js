const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** The scroll controller owns time. This module only paints cached DOM references. */
export function createCardMotion({ beats, lightweight = false }) {
  let enabled = false, disposed = false, lastRaw = 0, lastHold = .2;
  let lightweightMode = Boolean(lightweight);
  const decorations = [];
  const edgeFrames = [];
  const styleSnapshots = new Map();
  const classSnapshots = new Map();
  const writtenStyles = new WeakMap();

  function rememberStyle(element, name) {
    if (!styleSnapshots.has(element)) styleSnapshots.set(element, new Map());
    const saved = styleSnapshots.get(element);
    if (!saved.has(name)) saved.set(name, [element.style.getPropertyValue(name), element.style.getPropertyPriority(name)]);
  }
  function setStyle(element, name, value) {
    let cache = writtenStyles.get(element);
    if (!cache) { cache = new Map(); writtenStyles.set(element, cache); }
    if (cache.get(name) === value) return;
    rememberStyle(element, name);
    element.style.setProperty(name, value);
    cache.set(name, value);
  }
  function setClass(element, name, value) {
    if (!classSnapshots.has(element)) classSnapshots.set(element, new Map());
    const saved = classSnapshots.get(element);
    if (!saved.has(name)) saved.set(name, element.classList.contains(name));
    if (element.classList.contains(name) !== value) element.classList.toggle(name, value);
  }
  function decorate(parent, tag, className, svg = false) {
    const node = svg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
    node.setAttribute('class', className);
    node.setAttribute('aria-hidden', 'true');
    if (svg) node.setAttribute('focusable', 'false');
    parent.append(node);
    decorations.push(node);
    return node;
  }
  function frame(card) {
    setClass(card, 'motion-card', true);
    // Keep the ordered list's children as list items; its content wrapper is
    // the same size and can carry the purely decorative perimeter instead.
    const frameHost = card.tagName === 'OL' ? card.parentElement : card;
    if (frameHost !== card) setClass(frameHost, 'card-frame-host', true);
    const svg = decorate(frameHost, 'svg', 'card-edge', true);
    function perimeter(name) {
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('class', name);
      // Match the center of the card's 1px border, including its 16px corners.
      rect.setAttribute('x', '.5'); rect.setAttribute('y', '.5');
      rect.setAttribute('rx', '15.5'); rect.setAttribute('pathLength', '100');
      svg.append(rect);
      return rect;
    }
    perimeter('edge-track');
    let orbit = [];
    function rebuildOrbit() {
      // Recreate the head together with its tail so CSS animation phases stay
      // synchronized when the renderer profile changes on a visible card.
      for (const segment of orbit) segment.remove();
      orbit = [];
      // Preserve the same trail length and 4s CSS orbit with fewer independently
      // animated SVG strokes on phones. Desktop keeps its original 20 slices.
      const tailSegments = lightweightMode ? 6 : 20, segmentLength = 16 / tailSegments;
      const tailColors = [[190, 247, 255], [89, 219, 251], [139, 92, 246]];
      for (let index = tailSegments - 1; index >= 0; index--) {
        const distance = index / (tailSegments - 1);
        const segment = perimeter('edge-tail edge-orbit');
        orbit.push(segment);
        // Negative dash offset travels forward around the perimeter. A positive
        // per-segment offset places each tail slice behind the leading dot.
        const offset = (index + 1) * segmentLength;
        segment.style.setProperty('--edge-offset', String(offset));
        segment.style.setProperty('--edge-end', String(offset - 100));
        segment.setAttribute('stroke-dasharray', `${segmentLength + .025} ${100 - segmentLength - .025}`);
        // A violet tail cools into cyan, then the separate white leading light.
        const colorPosition = distance * (tailColors.length - 1);
        const colorIndex = Math.min(tailColors.length - 2, Math.floor(colorPosition));
        const colorMix = colorPosition - colorIndex;
        const color = tailColors[colorIndex].map((channel, i) => Math.round(channel + (tailColors[colorIndex + 1][i] - channel) * colorMix));
        segment.setAttribute('stroke', `rgb(${color.join(' ')})`);
        segment.setAttribute('stroke-opacity', String(.92 * (1 - distance) ** 1.35 + .015));
        segment.setAttribute('stroke-width', String(2.3 - 1.2 * distance));
      }
      for (const name of ['edge-halo', 'edge-glow', 'edge-head']) orbit.push(perimeter(`${name} edge-orbit`));
    }
    rebuildOrbit();
    edgeFrames.push(rebuildOrbit);
  }
  function group(beat, selector) { return [...beat.querySelectorAll(selector)]; }

  const entries = beats.map((beat, index) => {
    setClass(beat, 'has-card-motion', true);
    const cards = group(beat, '.glass-card, .process-steps, .founder-card, .client-quote, .faq-list');
    cards.forEach(frame);
    const sourcePair = beat.querySelector('.source-pair');
    if (sourcePair) {
      const svg = decorate(sourcePair, 'svg', 'source-signal', true);
      svg.setAttribute('viewBox', '0 0 40 50');
      svg.setAttribute('preserveAspectRatio', 'none');
      for (const name of ['signal-track', 'signal-fill']) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', 'M0 8 C25 8 15 42 40 42');
        path.setAttribute('pathLength', '1'); path.setAttribute('class', name);
        svg.append(path);
      }
    }
    const report = beat.querySelector('.report-metric');
    if (report) {
      const documentLines = decorate(report, 'span', 'report-lines');
      for (let i = 0; i < 4; i++) decorate(documentLines, 'i', 'report-line');
    }
    // These lines illustrate a response being formed; they are not a data chart.
    const answer = beat.querySelector('.data-question, .result-bi > p');
    if (answer) {
      const response = decorate(answer.parentElement, 'div', 'response-lines');
      answer.after(response);
      for (let i = 0; i < 3; i++) decorate(response, 'i', 'response-line');
    }
    return {
      beat, index, progress: null,
      stages: [group(beat, '.agent-flow > span'), group(beat, '.workflow-diagram > span'),
        group(beat, '.integration-chips > span'), group(beat, '.source-card'),
        group(beat, '.context-orbit > i'), group(beat, '.process-steps > li'),
        group(beat, '.faq-list > details')].filter(items => items.length),
      workflowLinks: group(beat, '.workflow-diagram > i'),
      reportLines: group(beat, '.report-line, .response-line'),
      before: beat.querySelector('.before-bar'), after: beat.querySelector('.after-bar'),
    };
  });

  function paint(entry, progress) {
    const rounded = Math.round(progress * 1000) / 1000;
    if (entry.progress === rounded) return;
    entry.progress = rounded;
    setStyle(entry.beat, '--card-progress', String(rounded));
    setStyle(entry.beat, '--card-energy', (.3 + rounded * .7).toFixed(3));
    setStyle(entry.beat, '--context-turn', `${rounded * 145}deg`);
    setStyle(entry.beat, '--portrait-scale', (1.035 - rounded * .035).toFixed(4));
    for (const stages of entry.stages) {
      const position = rounded * Math.max(1, stages.length - 1);
      stages.forEach((element, i) => {
        const charge = ease((position - i + .35) / .65);
        setStyle(element, '--step-charge', charge.toFixed(3));
        setStyle(element, '--link-progress', clamp(position - i).toFixed(3));
        setClass(element, 'motion-reached', !enabled || position >= i - .04);
        setClass(element, 'motion-current', enabled && Math.round(position) === i);
      });
    }
    entry.workflowLinks.forEach((link, i) => setStyle(link, '--link-progress', clamp(rounded * 2 - i).toFixed(3)));
    entry.reportLines.forEach((line, i, lines) => setStyle(line, '--line-progress', ease(rounded * (lines.length + .6) - i * .8).toFixed(3)));
    if (entry.before) setStyle(entry.before, '--bar-progress', ease(rounded / .55).toFixed(3));
    if (entry.after) setStyle(entry.after, '--bar-progress', ease((rounded - .3) / .7).toFixed(3));
  }

  function update(raw, readingHold = .2) {
    if (disposed) return;
    lastRaw = Number.isFinite(raw) ? raw : 0;
    lastHold = Number.isFinite(readingHold) && readingHold > 0 ? readingHold : .2;
    for (const entry of entries) paint(entry, enabled ? clamp((lastRaw - entry.index) / lastHold) : 1);
  }

  function setEnabled(value) {
    if (disposed) return;
    enabled = Boolean(value);
    for (const entry of entries) {
      entry.progress = null;
      setClass(entry.beat, 'card-motion-enabled', enabled);
    }
    update(lastRaw, lastHold);
  }

  function setLightweight(value) {
    if (disposed || lightweightMode === Boolean(value)) return;
    lightweightMode = Boolean(value);
    for (const rebuildOrbit of edgeFrames) rebuildOrbit();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const node of decorations) node.remove();
    for (const [element, styles] of styleSnapshots) for (const [name, [value, priority]] of styles) {
      if (value) element.style.setProperty(name, value, priority);
      else element.style.removeProperty(name);
    }
    for (const [element, classes] of classSnapshots) for (const [name, value] of classes) element.classList.toggle(name, value);
  }

  update(0);
  return { update, setEnabled, setLightweight, dispose };
}
