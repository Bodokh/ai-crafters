import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import test from 'node:test';
import { initializeSiteAnalytics } from '../src/site-analytics.js';

const events = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
const measurementId = 'AW-17903861190';
const scriptUrl = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

function fixture() {
  const window = new EventTarget();
  const scripts = [];
  const document = {
    head: { append(script) { scripts.push(script); } },
    createElement(tag) { assert.equal(tag, 'script'); return {}; },
    getElementById(id) { return scripts.find(script => script.id === id) || null; },
    querySelector(selector) {
      assert.equal(selector, `script[src="${scriptUrl}"]`);
      return scripts.find(script => script.src === scriptUrl) || null;
    },
  };
  return { window, document, scripts };
}

function assertNoListeners(window) {
  for (const event of events) assert.equal(getEventListeners(window, event).length, 0, event);
}

test('initialization makes no analytics request before someone interacts', () => {
  const f = fixture();
  const dispose = initializeSiteAnalytics(f);
  assert.equal(f.scripts.length, 0);
  assert.equal(f.window.dataLayer, undefined);
  assert.equal(f.window.gtag, undefined);
  for (const event of events) assert.equal(getEventListeners(f.window, event).length, 1);
  dispose();
  assertNoListeners(f.window);
});

test('each supported first interaction loads the existing measurement once and removes every listener', () => {
  for (const firstEvent of events) {
    const f = fixture();
    const dispose = initializeSiteAnalytics(f);
    assert.equal(initializeSiteAnalytics(f), dispose, 'repeated setup shares its pending listener set');
    f.window.dispatchEvent(new Event(firstEvent));
    assertNoListeners(f.window);
    for (const event of events) f.window.dispatchEvent(new Event(event));
    initializeSiteAnalytics(f);
    assert.equal(f.scripts.length, 1);
    assert.equal(f.scripts[0].src, scriptUrl);
    assert.equal(f.scripts[0].async, true);
    assert.equal(f.scripts[0].id, 'google-ads-library');
    assert.equal(f.window.dataLayer.length, 2);
    assert.equal(f.window.dataLayer[0][0], 'js');
    assert.ok(f.window.dataLayer[0][1] instanceof Date);
    assert.deepEqual(Array.from(f.window.dataLayer[1]), ['config', measurementId]);
    dispose();
    assertNoListeners(f.window);
  }
});

test('disposing a pending setup prevents later loading and allows a fresh setup', () => {
  const f = fixture();
  const dispose = initializeSiteAnalytics(f);
  dispose();
  dispose();
  f.window.dispatchEvent(new Event('scroll'));
  assert.equal(f.scripts.length, 0);
  assertNoListeners(f.window);
  initializeSiteAnalytics(f);
  f.window.dispatchEvent(new Event('keydown'));
  assert.equal(f.scripts.length, 1);
  assertNoListeners(f.window);
});

test('existing Google setup is preserved without a duplicate script or configuration', () => {
  const f = fixture();
  const originalQueue = [['js', new Date()], ['config', measurementId]];
  const originalGtag = function () { originalQueue.push(arguments); };
  f.window.dataLayer = originalQueue;
  f.window.gtag = originalGtag;
  f.scripts.push({ src: scriptUrl });
  initializeSiteAnalytics(f);
  f.window.dispatchEvent(new Event('pointerdown'));
  assert.equal(f.window.dataLayer, originalQueue);
  assert.equal(f.window.gtag, originalGtag);
  assert.equal(originalQueue.length, 2);
  assert.equal(f.scripts.length, 1);
  assertNoListeners(f.window);
});

test('another measurement keeps its queued commands and receives only the missing configuration', () => {
  const f = fixture();
  f.window.dataLayer = [['js', new Date()], ['config', 'G-OTHER']];
  f.scripts.push({ id: 'google-ads-library', src: scriptUrl });
  initializeSiteAnalytics(f);
  f.window.dispatchEvent(new Event('touchstart'));
  assert.equal(f.scripts.length, 1);
  assert.equal(f.window.dataLayer.length, 3);
  assert.deepEqual(Array.from(f.window.dataLayer.at(-1)), ['config', measurementId]);
  assertNoListeners(f.window);
});
