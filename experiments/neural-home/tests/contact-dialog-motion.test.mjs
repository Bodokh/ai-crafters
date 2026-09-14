import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import test from 'node:test';
import { createContactDialogMotion } from '../../../src/lib/contact-dialog-motion.js';

function fixture({ mobile = false, reduced = false, supported = true, lazy = false } = {}) {
  const animations = [];
  const queries = new Map();
  class MediaQuery extends EventTarget {
    constructor(matches) { super(); this.matches = matches; }
    change(matches) { this.matches = matches; this.dispatchEvent(new Event('change')); }
  }
  const document = {
    documentElement: { dataset: {} },
    defaultView: { matchMedia(query) {
      if (!queries.has(query)) queries.set(query, new MediaQuery(query.includes('reduced') ? reduced : mobile));
      return queries.get(query);
    } },
  };
  class Element extends EventTarget {
    constructor(name) { super(); this.name = name; this.children = []; this.ownerDocument = document; }
    contains(node) { return this === node || this.children.some(child => child.contains(node)); }
    append(node) { this.children.push(node); node.parent = this; }
    remove() { this.parent.children = this.parent.children.filter(node => node !== this); }
    setAttribute() {}
    animate(frames, options) {
      let finish, reject;
      const animation = { node: this, frames, options, cancellations: 0,
        finished: new Promise((resolve, rejectPromise) => { finish = resolve; reject = rejectPromise; }),
        finish() { finish(); },
        cancel() { this.cancellations++; reject(new Error('canceled')); },
      };
      animations.push(animation);
      return animation;
    }
  }
  document.createElement = name => new Element(name);
  const parts = Object.fromEntries(['dialog', 'surface', 'intro', 'fields', 'submit', 'direct', 'legal', 'close'].map(name => [name, new Element(name)]));
  parts.dialog.open = true;
  parts.dialog.append(parts.surface);
  for (const name of ['intro', 'fields', 'submit', 'direct', 'legal', 'close']) parts.surface.append(parts[name]);
  const input = new Element('input');
  for (const name of ['name', 'company', 'email', 'message']) parts.fields.append(new Element(name));
  parts.fields.children[0].append(input);
  document.activeElement = input;
  if (!supported) parts.dialog.animate = undefined;
  let ready = !lazy;
  const motion = createContactDialogMotion({ ...parts, getContent: () => ready ? parts : {} });
  const mountContent = () => { ready = true; motion.revealContent(); };
  return { ...parts, document, animations, queries, motion, mountContent };
}

const settle = () => new Promise(resolve => queueMicrotask(resolve));

test('keyboard, closed-dialog, and unsupported-browser opens have no effects or decoration', () => {
  for (const mode of ['instant', 'closed', 'unsupported']) {
    const f = fixture({ supported: mode !== 'unsupported' });
    if (mode === 'closed') f.dialog.open = false;
    f.motion.enter({ instant: mode === 'instant' });
    assert.equal(f.animations.length, 0);
    assert.equal(f.dialog.children.length, 1);
    assert.equal(f.queries.size, 0, 'no preference listeners or decoration are allocated for an instant open');
    f.motion.dispose();
  }
});

test('entrance keeps the focused field visible and confines effects to transform and opacity', async () => {
  const f = fixture();
  f.motion.enter();
  assert.ok(f.animations.some(animation => animation.node === f.dialog));
  assert.ok(!f.animations.some(animation => animation.node === f.fields.children[0]), 'the focused input group receives no reveal effect');
  assert.ok(f.fields.children.slice(1).every(field => f.animations.some(animation => animation.node === field)), 'unfocused field groups join the stagger');
  assert.equal(f.document.activeElement.name, 'input');
  for (const animation of f.animations) {
    assert.ok(animation.options.duration + (animation.options.delay || 0) <= 650);
    for (const frame of animation.frames) {
      assert.ok(Object.keys(frame).every(key => ['opacity', 'transform', 'offset'].includes(key)));
    }
    animation.finish();
  }
  await settle();
  assert.ok(f.animations.every(animation => animation.cancellations === 1), 'finished effects drop their fill and layers');
  f.motion.cancel();
  assert.ok(f.animations.every(animation => animation.cancellations === 1));
  f.motion.dispose();
});

test('mobile has a visible entrance within 380ms and never tilts the panel', () => {
  const f = fixture({ mobile: true });
  f.motion.enter();
  const shell = f.animations.find(animation => animation.node === f.dialog);
  assert.ok(shell.options.duration >= 320, 'the entrance remains visible at mobile frame cadence');
  assert.ok(Number(shell.frames[0].transform.match(/translateY\((\d+)px\)/)[1]) >= 32);
  assert.ok(Number(shell.frames[0].transform.match(/scale\(([\d.]+)\)/)[1]) <= 0.96);
  assert.ok(shell.frames[0].opacity <= 0.25);
  for (const animation of f.animations) {
    assert.ok(animation.options.duration + (animation.options.delay || 0) <= 380);
    assert.ok(animation.frames.every(frame => !/perspective|rotate[XYZ]/.test(frame.transform || '')));
  }
  f.motion.dispose();
});

test('reduced motion uses a short opacity-only reveal with no gradient layer', () => {
  const f = fixture({ reduced: true });
  f.motion.enter();
  assert.equal(f.animations.length, 1);
  assert.equal(f.animations[0].node, f.dialog);
  assert.equal(f.animations[0].options.duration, 100);
  assert.ok(f.animations[0].frames.every(frame => Object.keys(frame).every(key => key === 'opacity')));
  assert.equal(f.dialog.children.length, 1);
  f.motion.dispose();
});

test('changing motion preference immediately releases every active effect', async () => {
  const f = fixture();
  f.motion.enter();
  f.queries.get('(prefers-reduced-motion: reduce)').change(true);
  assert.ok(f.animations.every(animation => animation.cancellations === 1));
  f.motion.enter();
  assert.equal(f.animations.at(-1).options.duration, 100);
  f.queries.get('(prefers-reduced-motion: reduce)').change(false);
  assert.equal(f.animations.at(-1).cancellations, 1);
  await settle();
  f.motion.dispose();
});

test('late native focus preserves the entrance, while pointer and keyboard interaction finish it', async () => {
  const f = fixture({ mobile: true });
  for (const eventType of ['pointerdown', 'keydown']) {
    const previousCount = f.animations.length;
    f.motion.enter();
    const current = f.animations.slice(previousCount);
    f.dialog.dispatchEvent(new Event('focusin'));
    await settle();
    assert.ok(current.every(animation => animation.cancellations === 0), 'automatic focus must not interrupt the mobile reveal');
    f.dialog.dispatchEvent(new Event(eventType));
    assert.ok(current.every(animation => animation.cancellations === 1), `${eventType} immediately finishes the reveal`);
  }
  f.motion.dispose();
});

test('rapid close and reopen isolates old completions, reuses one layer, and disposes permanently', async () => {
  const f = fixture();
  f.motion.enter();
  const first = [...f.animations];
  f.motion.cancel();
  f.motion.enter();
  const second = f.animations.slice(first.length);
  assert.equal(f.dialog.children.length, 2, 'one reusable decorative layer');
  await settle();
  assert.ok(first.every(animation => animation.cancellations === 1));
  assert.ok(second.every(animation => animation.cancellations === 0), 'late old promises leave the new entrance untouched');
  f.motion.dispose();
  f.motion.dispose();
  assert.equal(getEventListeners(f.dialog, 'pointerdown').length, 0);
  assert.equal(getEventListeners(f.dialog, 'keydown').length, 0);
  assert.equal(getEventListeners(f.queries.get('(prefers-reduced-motion: reduce)'), 'change').length, 0);
  assert.ok(second.every(animation => animation.cancellations === 1));
  assert.equal(f.dialog.children.length, 1);
  const count = f.animations.length;
  f.motion.enter();
  assert.equal(f.animations.length, count);
});


test('lazy content joins the entrance once even after the shell finishes, without replaying it', async () => {
  const f = fixture({ lazy: true, mobile: true });
  f.motion.enter();
  const shellEffects = [...f.animations];
  assert.equal(shellEffects.length, 3, 'only shell, close, and sheen exist before the form mounts');
  for (const animation of shellEffects) animation.finish();
  await settle();
  f.mountContent();
  const contentEffects = f.animations.slice(shellEffects.length);
  assert.equal(contentEffects.length, 7, 'intro, three unfocused fields, submit, direct, and legal');
  assert.ok(contentEffects.every(animation => !shellEffects.some(shell => shell.node === animation.node)));
  f.mountContent();
  assert.equal(f.animations.length, shellEffects.length + contentEffects.length, 'readiness cannot double-animate content');
  f.motion.dispose();
});

test('late lazy content stays still after dismissal, interaction, or an accessible instant opening', () => {
  for (const mode of ['close', 'pointerdown', 'keydown', 'preference', 'instant', 'reduced', 'dispose']) {
    const f = fixture({ lazy: true, reduced: mode === 'reduced' });
    f.motion.enter({ instant: mode === 'instant' });
    if (mode === 'close') { f.dialog.open = false; f.motion.cancel(); }
    if (mode === 'pointerdown' || mode === 'keydown') f.dialog.dispatchEvent(new Event(mode));
    if (mode === 'preference') f.queries.get('(prefers-reduced-motion: reduce)').change(true);
    if (mode === 'dispose') f.motion.dispose();
    const count = f.animations.length;
    f.mountContent();
    assert.equal(f.animations.length, count, mode);
    f.motion.dispose();
  }
});

test('content loaded while closed participates normally in the next entrance', () => {
  const f = fixture({ lazy: true });
  f.motion.enter();
  f.dialog.open = false;
  f.motion.cancel();
  f.mountContent();
  const count = f.animations.length;
  f.dialog.open = true;
  f.motion.enter();
  assert.equal(f.animations.length - count, 10);
  f.motion.dispose();
});
