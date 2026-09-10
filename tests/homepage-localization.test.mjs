import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { hebrewCopy, renderLocalizedHome } from '../experiments/neural-home/src/localization.js';

const [he, en] = await Promise.all([
  readFile(new URL('../messages/he.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../messages/en.json', import.meta.url), 'utf8').then(JSON.parse),
]);
const homepage = await readFile(new URL('../experiments/neural-home/index.html', import.meta.url), 'utf8');

const homepageNamespaces = [
  'metadata',
  'clients',
  'nav',
  'hero',
  'services',
  'service',
  'process',
  'about',
  'testimonials',
  'contact',
  'footer',
];

const leafPaths = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' ? leafPaths(child, path) : path;
  });

test('shared site dictionaries expose the same content fields in both locales', () => {
  for (const namespace of homepageNamespaces) {
    assert.deepEqual(
      leafPaths(en[namespace]).sort(),
      leafPaths(he[namespace]).sort(),
      `${namespace} content fields differ`,
    );
  }
  assert.deepEqual(leafPaths(en).sort(), leafPaths(he).sort());
});

test('English and Hebrew shared navigation labels use cases consistently', () => {
  assert.equal(en.nav.work, 'Use Cases');
  assert.equal(he.nav.work, 'מקרי שימוש');
});

test('shared inquiry forms keep project CTA and expectations consistent in both locales', () => {
  for (const messages of [en, he]) {
    assert.equal(messages.nav.start, messages.hero.cta.primary);
    assert.equal(messages.contact.form.submit, messages.hero.cta.primary);
    assert.ok(messages.contact.form.messagePlaceholder.trim());
    assert.ok(messages.contact.form.nextStep.trim());
  }
});

test('accepted neural copy is fully localized before JavaScript and retains all journey checkpoints', () => {
  const english = renderLocalizedHome(homepage, 'en');
  const hebrew = renderLocalizedHome(homepage, 'he');
  assert.match(english, /<html\b[^>]*lang="en"[^>]*dir="ltr"/);
  assert.match(hebrew, /<html\b[^>]*lang="he"[^>]*dir="rtl"/);
  assert.match(english, /<h1\b[^>]*>Custom AI\.<br>Built for you\.<\/h1>/);
  assert.match(hebrew, /<h1\b[^>]*>פתרונות AI\.<br>בדיוק בשבילכם\.<\/h1>/);
  assert.ok(hebrew.includes('בהתאמה למערכות, לנתונים ולמטרות העסקיות שלכם.'));
  const keys = [...homepage.matchAll(/\bdata-i18n(?:-(?:aria-label|alt|content))?="([^"]+)"/g)].map(([, key]) => key);
  for (const key of keys) assert.ok(hebrewCopy[key]?.trim(), `Missing initial Hebrew content: ${key}`);
  for (const html of [english, hebrew]) {
    assert.equal((html.match(/\bdata-beat="\d+"/g) ?? []).length, 19);
    assert.match(html, /data-contact-open/);
  }
  assert.equal(hebrewCopy['hero.explore'], hebrewCopy['contact.start']);
  assert.equal(hebrewCopy['hero.explore'], 'נדבר על הפרויקט שלכם');
});

test('homepage positioning describes custom AI without blanket performance promises', () => {
  assert.match(en.metadata.title, /custom AI/i);
  assert.match(he.metadata.title, /AI.*התאמה אישית/);
  for (const locale of ['en', 'he']) {
    const rendered = renderLocalizedHome(homepage, locale);
    assert.doesNotMatch(rendered, /80%|maximum return|24\/7|without human intervention|החזר השקעה מקסימלי|ללא התערבות אדם/i);
    assert.doesNotMatch(rendered, /don't get left behind|אל תישארו מאחור/i);
  }
  for (const messages of [en, he]) {
    const marketingCopy = JSON.stringify({
      hero: messages.hero,
      services: messages.services,
      service: messages.service,
      process: messages.process,
      contact: messages.contact,
    });
    assert.doesNotMatch(marketingCopy, /80%|maximum return|24\/7|without human intervention|החזר השקעה מקסימלי|ללא התערבות אדם/i);
    assert.doesNotMatch(marketingCopy, /don't get left behind|אל תישארו מאחור/i);
  }
});

test('Existing attributed customer evidence remains unchanged', () => {
  assert.equal(
    en.testimonials[3].quote,
    'Eran delivered a complex solution in a quarter of the expected time. His technical expertise and strategic thinking turned what looked like a two-month project into a two-week reality.',
  );
});
