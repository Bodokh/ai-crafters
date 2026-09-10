import assert from 'node:assert/strict';
import { globSync } from 'node:fs';
import test from 'node:test';

// Run against the real Next server (or its deployment), not the Vite preview.
const origin = process.env.SITE_TEST_URL;
const get = path => fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(10000) });

test('public homepage URLs serve the accepted bilingual neural documents and assets', { skip: !origin }, async () => {
  const assets = new Set();
  for (const [path, locale] of [['/', 'en'], ['/he', 'he']]) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const html = await response.text();
    assert.match(html, new RegExp(`lang="${locale}"`));
    assert.match(html, /id="neural-canvas"/);
    assert.equal((html.match(/class="story-beat\b/g) || []).length, 19);
    assert.doesNotMatch(html, /content="noindex|VISUAL COMPARISON|__next_f\.push/);
    assert.match(html, new RegExp(`rel="canonical" href="https://www\\.ai-crafters\\.com${path === '/' ? '/' : '/he'}"`));
    for (const [, asset] of html.matchAll(/(?:src|href)="(\/_home\/[^"?#]+)"/g)) assets.add(asset);
  }
  for (const file of globSync('public/_home/assets/neuron-*.webp')) assets.add(file.replace(/^public/, ''));
  assert.equal([...assets].filter(path => path.includes('/neuron-')).length, 4);
  for (const path of assets) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const expected = path.endsWith('.js') ? /javascript/ : path.endsWith('.css') ? /text\/css/ : path.endsWith('.woff2') ? /font\/woff2/ : /image\//;
    assert.match(response.headers.get('content-type'), expected, path);
  }
});

test('homepage normalization, secondary pages, APIs, and retired comparison routes stay distinct', { skip: !origin }, async () => {
  const redirect = await get('/en?source=homepage-check');
  assert.equal(redirect.status, 308);
  const destination = new URL(redirect.headers.get('location'), origin);
  assert.equal(destination.pathname, '/');
  assert.equal(destination.search, '?source=homepage-check');
  for (const path of ['/careers', '/he/careers', '/use-cases', '/he/use-cases', '/sitemap.xml', '/robots.txt']) {
    assert.equal((await get(path)).status, 200, path);
  }
  for (const path of ['/comparison.html', '/baseline.html', '/he/baseline.html']) {
    assert.equal((await get(path)).status, 404, path);
  }
  // GET cannot submit a lead or application, but proves both API routes exist.
  for (const path of ['/api/contact', '/api/careers']) assert.equal((await get(path)).status, 405, path);
});
