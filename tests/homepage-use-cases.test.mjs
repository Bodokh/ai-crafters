import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getFeaturedUseCases, useCasesOverview } from '../src/content/useCases.ts';
import { renderLocalizedHome } from '../experiments/neural-home/src/localization.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the accepted neural journey is the homepage source and the old Next homepage is removed', async () => {
  const source = await read('experiments/neural-home/index.html');
  assert.deepEqual([...source.matchAll(/\bdata-beat="(\d+)"/g)].map(([, beat]) => Number(beat)),
    Array.from({ length: 19 }, (_, index) => index));
  assert.match(source, /<h1\b[^>]*>Custom AI\.<br>Built for you\.<\/h1>/);
  assert.match(source, /<script\b[^>]*src="\/src\/main\.js"/);
  assert.doesNotMatch(source, /comparison\.html|baseline\.html|visual comparison|<iframe\b/i);
  await assert.rejects(() => access(new URL('../src/app/[locale]/page.tsx', import.meta.url)));
});

test('the retired projects section is no longer part of the site', async () => {
  await assert.rejects(() => access(new URL('../src/components/Projects.tsx', import.meta.url)));
});

test('both homepages connect their accepted results and capabilities to localized public pages', async () => {
  const source = await read('experiments/neural-home/index.html');
  for (const locale of ['en', 'he']) {
    const html = renderLocalizedHome(source, locale);
    const prefix = locale === 'he' ? '/he' : '';
    for (const path of ['/use-cases', '/careers', '/terms', '/services/ai-agent-development']) {
      assert.ok(html.includes(`href="${prefix}${path}"`), `${locale}: missing ${path}`);
    }
    assert.match(html, /data-key="insurance"/);
    assert.match(html, /data-key="reports"/);
    assert.match(html, /data-key="revenue"/);
    assert.match(html, /id="agents"/);
  }
  const navbar = await read('src/components/Navbar.tsx');
  assert.match(navbar, /path:\s*'\/',\s*section:\s*'agents'/);
});

test('the homepage entry retains the desktop renderer and the mobile vGPU sprite upgrade', async () => {
  const [main, mobile, sprites] = await Promise.all([
    read('experiments/neural-home/src/main.js'),
    read('experiments/neural-home/src/mobile-scene.js'),
    read('experiments/neural-home/src/mobile-neuron-sprites.js'),
  ]);
  assert.match(main, /import\('\.\/mobile-scene\.js'\)/);
  assert.match(main, /import\('\.\/scene\.js'\)/);
  assert.match(mobile, /import\s*\{\s*upgradeMobileNeuronSprites\s*\}\s*from\s*'\.\/mobile-neuron-sprites\.js'/);
  assert.match(mobile, /upgradeMobileNeuronSprites\(window, sprites\)/);
  const assets = [...sprites.matchAll(/new URL\('\.\/assets\/neurons\/([^']+)'/g)].map(([, asset]) => asset);
  assert.deepEqual(assets, ['neuron-0.webp', 'neuron-1.webp', 'neuron-2.webp', 'neuron-3.webp']);
  await Promise.all(assets.map(asset => access(new URL(`../experiments/neural-home/src/assets/neurons/${asset}`, import.meta.url))));
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
