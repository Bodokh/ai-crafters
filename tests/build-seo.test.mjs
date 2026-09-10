import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import test from 'node:test';

const htmlFiles = [
  ...globSync('.next/server/app/{en,he}.html'),
  ...globSync('.next/server/app/{en,he}/**/*.html'),
].sort();

const decode = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const contentOf = (html, key, attribute = 'name') =>
  decode(
    html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`))?.[1] ?? '',
  );

const routeFromFile = (file) => {
  const route = file
    .replace('.next/server/app/', '')
    .replace(/\.html$/, '')
    .replace(/^en(?=\/|$)/, '')
    .replace(/^he(?=\/|$)/, '/he');
  return route || '/';
};

test('the production build contains every localized public page', () => {
  assert.equal(htmlFiles.length, 34);
  assert.equal(htmlFiles.filter((file) => file.includes('/app/en')).length, 17);
  assert.equal(htmlFiles.filter((file) => file.includes('/app/he')).length, 17);
});

test('every built page has complete, self-consistent SEO metadata', () => {
  const titlesByLocale = { en: new Set(), he: new Set() };

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const route = routeFromFile(file);
    const locale = file.includes('/app/he') ? 'he' : 'en';
    const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
    const description = contentOf(html, 'description');
    const canonical = decode(
      html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '',
    );
    const canonicalUrl = new URL(canonical);
    const h1Count = html.match(/<h1\b/g)?.length ?? 0;

    assert.ok(title.length >= 20 && title.length <= 65, `${route}: title length ${title.length}`);
    assert.ok(
      description.length >= (locale === 'he' ? 60 : 80) && description.length <= 200,
      `${route}: description length ${description.length}`,
    );
    assert.equal(canonicalUrl.pathname.replace(/\/$/, '') || '/', route, `${route}: canonical`);
    assert.equal(h1Count, 1, `${route}: expected one H1, found ${h1Count}`);
    assert.doesNotMatch(contentOf(html, 'robots'), /noindex/i, `${route}: noindex`);
    assert.equal(contentOf(html, 'og:title', 'property'), title, `${route}: og:title`);
    assert.equal(
      contentOf(html, 'og:description', 'property'),
      description,
      `${route}: og:description`,
    );
    assert.ok(contentOf(html, 'og:image', 'property'), `${route}: og:image`);
    assert.ok(contentOf(html, 'twitter:card'), `${route}: twitter card`);

    for (const hreflang of ['en', 'he', 'x-default']) {
      assert.match(
        html,
        new RegExp(`<link rel="alternate" hrefLang="${hreflang}" href="https?://`),
        `${route}: ${hreflang} alternate`,
      );
    }

    assert.ok(!titlesByLocale[locale].has(title), `${route}: duplicate ${locale} title`);
    titlesByLocale[locale].add(title);

    const jsonLdBlocks = [
      ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
    ];
    assert.ok(jsonLdBlocks.length > 0, `${route}: JSON-LD missing`);
    jsonLdBlocks.forEach((match) => assert.doesNotThrow(() => JSON.parse(match[1])));
  }
});

test('every public page is reachable through rendered internal links', () => {
  const pages = new Map(htmlFiles.map(file => [routeFromFile(file), readFileSync(file, 'utf8')]));
  const reached = new Set();
  const pending = ['/'];
  while (pending.length) {
    const path = pending.shift();
    if (reached.has(path) || !pages.has(path)) continue;
    reached.add(path);
    const html = pages.get(path);
    const canonical = decode(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '');
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const url = new URL(decode(href), canonical);
      if (url.origin !== new URL(canonical).origin) continue;
      const target = url.pathname.replace(/\/$/, '') || '/';
      if (pages.has(target) && !reached.has(target)) pending.push(target);
    }
  }
  assert.deepEqual([...pages.keys()].filter(path => !reached.has(path)), [], 'Orphan pages');
});

test('buyer landing pages offer an inquiry and breadcrumbs use distinct destinations', () => {
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const route = routeFromFile(file);
    if (/\/(services|compare|resources)\//.test(route)) {
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
      assert.match(main, /data-site-contact-trigger/, `${route}: body inquiry action`);
    }
    for (const [, block] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
      for (const entry of [JSON.parse(block)].flat()) {
        if (entry['@type'] !== 'BreadcrumbList') continue;
        const destinations = entry.itemListElement.map(item => item.item);
        assert.equal(new Set(destinations).size, destinations.length, `${route}: duplicate breadcrumb destinations`);
      }
    }
  }
});

test('homepage FAQ markup describes answers visible in the page', () => {
  for (const locale of ['en', 'he']) {
    const html = readFileSync(`.next/server/app/${locale}.html`, 'utf8');
    const visibleText = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    const entries = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap(([, block]) => [JSON.parse(block)].flat());
    const faq = entries.find(entry => entry['@type'] === 'FAQPage');
    assert.ok(faq, `${locale}: FAQ markup`);
    for (const question of faq.mainEntity) {
      assert.ok(visibleText.includes(question.name), `${locale}: question absent from visible content`);
      assert.ok(visibleText.includes(question.acceptedAnswer.text), `${locale}: answer absent from visible content`);
    }
  }
});
