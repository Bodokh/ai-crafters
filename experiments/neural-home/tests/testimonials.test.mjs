import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// A small DOM/clock adapter exercises the real controller without a browser,
// WebGL, layout measurements, or elapsed-time waits.
class Element extends EventTarget {
  constructor(tag) {
    super();
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.className = '';
    this.dataset = {};
    this.inert = false;
    this.parent = null;
    this.scrollTop = 0;
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { for (const name of names) if (!this.classList.contains(name)) this.className = [this.className, name].filter(Boolean).join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      toggle: (name, enabled) => { if (enabled) this.classList.add(name); else this.classList.remove(name); },
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  append(...nodes) { for (const node of nodes) { node.remove(); this.children.push(node); node.parent = this; } }
  prepend(...nodes) { for (const node of nodes) node.remove(); this.children.unshift(...nodes); for (const node of nodes) node.parent = this; }
  replaceChildren(...nodes) { for (const node of [...this.children]) node.remove(); this.append(...nodes); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null; }
  matches(selector) {
    return selector.split(',').some(raw => {
      const name = raw.trim();
      return name.startsWith('.') ? this.classList.contains(name.slice(1)) : this.tagName === name.toUpperCase();
    });
  }
  querySelectorAll(selector) {
    return this.children.flatMap(node => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

const source = readFileSync(new URL('../src/testimonials.js', import.meta.url), 'utf8')
  .replace('export function createTestimonials', 'function createTestimonials');

function harness({ enhanced = true, locale = 'en' } = {}) {
  const document = new EventTarget();
  document.hidden = false;
  document.documentElement = new Element('html');
  document.documentElement.lang = locale;
  if (enhanced) document.documentElement.classList.add('is-enhanced');
  document.createElement = tag => new Element(tag);
  document.createElementNS = (namespaceURI, tag) => Object.assign(new Element(tag), { namespaceURI });
  const beat = new Element('div'), card = new Element('figure');
  card.className = 'client-quote';
  const originals = [new Element('blockquote'), new Element('figcaption')];
  card.append(...originals);
  beat.append(card);
  const timers = new Map(), observers = [];
  let sequence = 0;
  class Observer {
    constructor(callback, options) { this.callback = callback; this.options = options; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
    trigger(value) { this.callback([{ isIntersecting: value }]); }
  }
  const sandbox = {
    document, AbortController, IntersectionObserver: Observer,
    // Reduced motion affects the CSS transition, never automatic playback.
    matchMedia: () => ({ matches: true }),
    setTimeout: (callback, ms) => { const id = ++sequence; timers.set(id, { callback, ms }); return id; },
    clearTimeout: id => timers.delete(id),
  };
  vm.createContext(sandbox);
  vm.runInContext(`${source}\nthis.factory = createTestimonials;`, sandbox);
  const api = sandbox.factory({ beat, locale });
  const pending = () => {
    assert.equal(timers.size, 1, 'exactly one playback timer');
    return timers.entries().next().value;
  };
  const tick = delay => {
    const [id, timer] = pending();
    assert.equal(timer.ms, delay);
    timers.delete(id);
    timer.callback();
  };
  const click = name => {
    const button = card.querySelector(`.testimonial-control--${name}`);
    assert.ok(button);
    button.dispatchEvent(new Event('click'));
  };
  const counter = () => card.querySelector('.testimonial-position')?.textContent;
  const visible = value => { document.hidden = !value; document.dispatchEvent(new Event('visibilitychange')); };
  return { api, document, beat, card, timers, observers, observer: observers[0], nearObserver: observers[1], originals, tick, click, counter, pending, visible };
}

test('previews one story while approaching an inert checkpoint, then waits for the readable card', () => {
  const h = harness();
  h.beat.inert = true;
  h.api.update({ active: false, approaching: false });
  assert.equal(h.counter(), undefined);
  h.api.update({ active: false, approaching: true });
  assert.equal(h.counter(), '01 / 03');
  assert.ok(h.beat.inert, 'prewarming never removes checkpoint inertness');
  h.tick(1000);
  assert.equal(h.counter(), '02 / 03');
  assert.equal(h.timers.size, 0, 'waiting near an offscreen card cannot create a recurring loop');
  h.api.update({ active: false, approaching: true });
  assert.equal(h.timers.size, 0);
  h.beat.inert = false;
  h.observer.trigger(true);
  h.api.update({ active: true, approaching: false });
  h.tick(8000);
  assert.equal(h.counter(), '03 / 03');
  const accessible = h.card.querySelectorAll('.testimonial-slide').filter(slide => !slide.inert);
  assert.equal(accessible.length, 1);
  assert.equal(accessible[0].getAttribute('aria-hidden'), 'false');
  h.api.dispose();
});

test('reversing away cancels prewarm; reentry has a fresh short interval and rejects stale callbacks', () => {
  const h = harness();
  h.api.update({ active: false, approaching: true });
  const [, abandoned] = h.pending();
  h.api.update({ active: false, approaching: false });
  assert.equal(h.timers.size, 0);
  assert.equal(h.card.classList.contains('testimonial-can-transition'), false);
  h.api.update({ active: false, approaching: true });
  const [replacement] = h.pending();
  abandoned.callback();
  assert.equal(h.counter(), '01 / 03');
  assert.ok(h.timers.has(replacement), 'late callbacks must not erase a replacement timer');
  h.tick(1000);
  assert.equal(h.counter(), '02 / 03');
  assert.equal(h.timers.size, 0);
  h.api.dispose();
});

test('direct arrival and manual navigation autoplay without hover or focus stopping them', () => {
  const h = harness();
  h.observer.trigger(true);
  h.api.update({ active: true, approaching: false });
  h.card.dispatchEvent(new Event('pointerenter'));
  h.card.dispatchEvent(new Event('focusin'));
  h.tick(1000);
  assert.equal(h.counter(), '02 / 03');
  const [oldTimer] = h.pending();
  h.card.querySelector('.testimonial-slides').scrollTop = 80;
  h.click('next');
  assert.equal(h.counter(), '03 / 03');
  assert.notEqual(h.pending()[0], oldTimer);
  assert.equal(h.card.querySelector('.testimonial-slides').scrollTop, 0);
  h.tick(8000);
  assert.equal(h.counter(), '01 / 03');
  h.api.dispose();
});

test('explicit pause survives navigation and reentry; hidden/inactive states cancel playback and transitions', () => {
  const h = harness();
  h.observer.trigger(true);
  h.api.update({ active: true });
  h.click('pause');
  h.click('next');
  assert.equal(h.counter(), '02 / 03');
  assert.equal(h.timers.size, 0);
  h.api.update({ active: false });
  h.api.update({ active: true });
  assert.equal(h.timers.size, 0);
  h.click('pause');
  h.visible(false);
  assert.equal(h.timers.size, 0);
  assert.equal(h.card.classList.contains('testimonial-can-transition'), false);
  h.visible(true);
  h.tick(1000);
  const [, stale] = h.pending();
  h.observer.trigger(false);
  assert.equal(h.timers.size, 0);
  stale.callback();
  assert.equal(h.counter(), '03 / 03');
  h.api.dispose();
});

test('static Hebrew/reduced-motion mode prewarms from the viewport margin despite active:false', () => {
  const h = harness({ enhanced: false, locale: 'he' });
  h.api.update({ active: false, approaching: false });
  h.nearObserver.trigger(true);
  h.tick(1000);
  assert.equal(h.counter(), '02 / 03');
  assert.equal(h.timers.size, 0);
  h.observer.trigger(true);
  h.tick(8000);
  assert.equal(h.counter(), '03 / 03');
  assert.equal(h.card.querySelector('.testimonial-control--pause').getAttribute('aria-label'), 'השהיית סיפורי הלקוחות');
  h.observer.trigger(false);
  h.nearObserver.trigger(false);
  assert.equal(h.timers.size, 0);
  h.api.dispose();
});

test('dispose cancels pending work and restores the original card idempotently', () => {
  const h = harness();
  h.api.update({ approaching: true });
  const [, pending] = h.pending();
  h.api.dispose();
  h.api.dispose();
  pending.callback();
  assert.equal(h.timers.size, 0);
  assert.ok(h.observers.every(observer => observer.disconnected));
  assert.deepEqual(h.card.children, h.originals);
  assert.equal(h.card.getAttribute('aria-label'), null);
  assert.equal(h.card.className, 'client-quote');
});
