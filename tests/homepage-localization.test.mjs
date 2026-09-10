import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [he, en] = await Promise.all([
  readFile(new URL('../messages/he.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../messages/en.json', import.meta.url), 'utf8').then(JSON.parse),
]);

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

test('Hebrew and English homepages expose the same content fields', () => {
  for (const namespace of homepageNamespaces) {
    assert.deepEqual(
      leafPaths(en[namespace]).sort(),
      leafPaths(he[namespace]).sort(),
      `${namespace} content fields differ`,
    );
  }
  assert.deepEqual(leafPaths(en).sort(), leafPaths(he).sort());
});

test('English and Hebrew navigation label the homepage work section as use cases', () => {
  assert.equal(en.nav.work, 'Use Cases');
  assert.equal(he.nav.work, 'מקרי שימוש');
});

test('Both locales keep the project inquiry CTA and form expectations consistent', () => {
  for (const messages of [en, he]) {
    assert.equal(messages.nav.start, messages.hero.cta.primary);
    assert.equal(messages.contact.form.submit, messages.hero.cta.primary);
    assert.ok(messages.contact.form.messagePlaceholder.trim());
    assert.ok(messages.contact.form.nextStep.trim());
  }
});

test('Homepage positioning describes custom AI without blanket performance promises', () => {
  assert.match(en.metadata.title, /custom AI/i);
  assert.match(he.metadata.title, /AI.*התאמה אישית/);
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
