import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getFeaturedUseCases, useCasesOverview } from '../src/content/useCases.ts';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the homepage renders featured use cases instead of the projects grid', async () => {
  const appContent = await read('src/components/AppContent.tsx');

  assert.match(appContent, /FeaturedUseCases/);
  assert.doesNotMatch(appContent, /Projects/);
});

test('the retired projects section is no longer part of the site', async () => {
  await assert.rejects(() => access(new URL('../src/components/Projects.tsx', import.meta.url)));
});

test('featured use cases preview the first three cases and expose show more', async () => {
  const source = await read('src/components/FeaturedUseCases.tsx');

  assert.match(source, /id="work"/);
  assert.match(source, /getFeaturedUseCases/);
  assert.match(source, /showMore/);
  assert.match(source, /aria-expanded/);
});

test('shared use-case content selects three featured cases in both locales', async () => {
  const source = await read('src/content/useCases.ts');
  const slugs = [...source.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);

  assert.match(source, /export const FEATURED_USE_CASE_LIMIT = 3/);
  assert.match(source, /export const getFeaturedUseCases/);
  assert.deepEqual(slugs.slice(0, 3), [
    'insurance-claim-settlements',
    'business-intelligence-qa',
    'vendor-bank-verification',
  ]);
  for (const locale of ['en', 'he']) {
    assert.deepEqual(getFeaturedUseCases(locale).map(item => item.slug), slugs.slice(0, 3));
    assert.ok(useCasesOverview.homepage.showMore[locale].trim());
    assert.ok(useCasesOverview.homepage.showLess[locale].trim());
    assert.notEqual(useCasesOverview.homepage.showMore[locale], useCasesOverview.homepage.showLess[locale]);
  }
});
