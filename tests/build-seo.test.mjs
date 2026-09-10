import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { servicePages } from '../src/content/site.ts';

// Audit the documents served before Next's locale routing, never stale Next homes.
const homePages = [
  { file: 'public/_home/index.html', route: '/', locale: 'en' },
  { file: 'public/_home/he/index.html', route: '/he', locale: 'he' },
];
const secondaryPages = [...globSync('.next/server/app/{en,he}/**/*.html')].sort().map(file => ({
  file,
  locale: file.startsWith('.next/server/app/he/') ? 'he' : 'en',
  route: file.replace('.next/server/app/', '').replace(/\.html$/, '')
    .replace(/^en\//, '/').replace(/^he\//, '/he/'),
}));
const pages = [...homePages, ...secondaryPages];

const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_entity, code) => {
  if (code[0] !== '#') return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[code.toLowerCase()];
  return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
});
const attributes = tag => Object.fromEntries([...tag.matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
  .map(([, name, doubleQuoted, singleQuoted]) => [name.toLowerCase(), decode(doubleQuoted ?? singleQuoted)]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attributes(tag));
const contentOf = (html, key, attribute = 'name') => tags(html, 'meta').find(tag => tag[attribute] === key)?.content ?? '';
const canonicalOf = html => tags(html, 'link').find(tag => tag.rel === 'canonical')?.href ?? '';
const flattenGraph = value => Array.isArray(value) ? value.flatMap(flattenGraph)
  : value && typeof value === 'object' ? [value, ...flattenGraph(value['@graph'])] : [];
const jsonLdEntries = html => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attr]) => attributes(`<script ${attr}>`).type === 'application/ld+json')
  .flatMap(([, , block]) => flattenGraph(JSON.parse(block)));
const normalizeText = text => text.replace(/\s+/gu, ' ').trim();
const visibleText = html => normalizeText(decode(html
  .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]*>/g, ' ')));

test('the production build contains both neural homepages and every localized secondary page', () => {
  for (const { file } of homePages) assert.ok(existsSync(file), `Missing production homepage: ${file}`);
  assert.equal(secondaryPages.length, 32);
  for (const locale of ['en', 'he']) {
    assert.equal(pages.filter(page => page.locale === locale).length, 17);
    assert.ok(!existsSync(`.next/server/app/${locale}.html`), `${locale}: obsolete Next homepage was built`);
  }
});

test('the served homepage documents contain the accepted journey and its production assets', () => {
  for (const { file, route } of homePages) {
    const html = readFileSync(file, 'utf8');
    assert.deepEqual([...html.matchAll(/\bdata-beat="(\d+)"/g)].map(([, beat]) => Number(beat)),
      Array.from({ length: 19 }, (_, index) => index), `${route}: accepted 19-beat journey`);
    assert.match(html, /id="neural-canvas"/, `${route}: neural renderer canvas`);
    const scripts = tags(html, 'script').filter(tag => tag.type === 'module' && tag.src);
    assert.ok(scripts.length, `${route}: production entry script`);
    for (const { src } of scripts) {
      assert.match(src, /^\/_home\/assets\/[^/]+\.js$/, `${route}: isolated homepage asset path`);
      assert.ok(existsSync(`public${src}`), `${route}: missing ${src}`);
    }
    assert.doesNotMatch(html, /comparison\.html|baseline\.html|visual comparison|<iframe\b|\/_next\/static/i);
  }
});

test('every built page has complete, self-consistent SEO metadata', () => {
  const titlesByLocale = { en: new Set(), he: new Set() };
  for (const { file, route, locale } of pages) {
    const html = readFileSync(file, 'utf8');
    const title = decode(html.match(/<title\b[^>]*>(.*?)<\/title>/s)?.[1] ?? '');
    const description = contentOf(html, 'description');
    const canonical = canonicalOf(html);
    const canonicalUrl = new URL(canonical);
    const h1Count = html.match(/<h1\b/g)?.length ?? 0;
    assert.ok(title.length >= 20 && title.length <= 65, `${route}: title length ${title.length}`);
    assert.ok(description.length >= (locale === 'he' ? 60 : 80) && description.length <= 200,
      `${route}: description length ${description.length}`);
    assert.equal(canonicalUrl.pathname.replace(/\/$/, '') || '/', route, `${route}: canonical`);
    assert.equal(h1Count, 1, `${route}: expected one H1, found ${h1Count}`);
    assert.doesNotMatch(contentOf(html, 'robots'), /noindex/i, `${route}: noindex`);
    assert.equal(contentOf(html, 'og:title', 'property'), title, `${route}: og:title`);
    assert.equal(contentOf(html, 'og:description', 'property'), description, `${route}: og:description`);
    assert.ok(contentOf(html, 'og:image', 'property'), `${route}: og:image`);
    assert.ok(contentOf(html, 'twitter:card'), `${route}: twitter card`);
    for (const hreflang of ['en', 'he', 'x-default']) {
      const alternate = tags(html, 'link').find(tag => tag.rel === 'alternate' && tag.hreflang === hreflang);
      assert.match(alternate?.href ?? '', /^https?:\/\//, `${route}: ${hreflang} alternate`);
    }
    assert.ok(!titlesByLocale[locale].has(title), `${route}: duplicate ${locale} title`);
    titlesByLocale[locale].add(title);
    assert.ok(jsonLdEntries(html).length, `${route}: JSON-LD missing`);
  }
});

test('every public page is reachable from the served homepage through rendered internal links', () => {
  const renderedPages = new Map(pages.map(({ file, route }) => [route, readFileSync(file, 'utf8')]));
  const reached = new Set();
  const pending = ['/'];
  while (pending.length) {
    const path = pending.shift();
    if (reached.has(path) || !renderedPages.has(path)) continue;
    reached.add(path);
    const html = renderedPages.get(path);
    const canonical = new URL(canonicalOf(html));
    for (const { href } of tags(html, 'a')) {
      if (!href) continue;
      const url = new URL(href, canonical);
      if (url.origin !== canonical.origin) continue;
      const target = url.pathname.replace(/\/$/, '') || '/';
      if (renderedPages.has(target) && !reached.has(target)) pending.push(target);
    }
  }
  assert.deepEqual([...renderedPages.keys()].filter(path => !reached.has(path)), [], 'Orphan pages');
});

test('service pages expose all other localized services to readers and crawlers', () => {
  assert.equal(servicePages.length, 6);
  for (const { file, route, locale } of secondaryPages.filter(page => /\/services\//.test(page.route))) {
    const html = readFileSync(file, 'utf8');
    const related = html.match(/<section\b[^>]*aria-labelledby="related-services-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(related, `${route}: related service navigation`);
    const links = tags(related, 'a').map(tag => tag.href);
    for (const service of servicePages.filter(service => !route.endsWith(`/${service.slug}`))) {
      assert.ok(links.includes(`${locale === 'he' ? '/he' : ''}/services/${service.slug}`), `${route}: missing ${service.slug}`);
      assert.ok(visibleText(related).includes(service.title[locale]), `${route}: localized service title`);
    }
  }
});

test('buyer landing pages offer an inquiry and breadcrumbs use distinct destinations', () => {
  for (const { file, route } of pages) {
    const html = readFileSync(file, 'utf8');
    if (/\/(services|compare|resources)\//.test(route)) {
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
      assert.match(main, /data-site-contact-trigger/, `${route}: body inquiry action`);
    }
    for (const entry of jsonLdEntries(html)) {
      if (entry['@type'] !== 'BreadcrumbList') continue;
      const destinations = entry.itemListElement.map(item => item.item);
      assert.equal(new Set(destinations).size, destinations.length, `${route}: duplicate breadcrumb destinations`);
    }
  }
});

test('served homepage FAQ markup describes answers visible in each localized page', () => {
  for (const { file, locale } of homePages) {
    const html = readFileSync(file, 'utf8');
    const content = visibleText(html);
    const faq = jsonLdEntries(html).find(entry => entry['@type'] === 'FAQPage');
    assert.ok(faq, `${locale}: FAQ markup`);
    assert.equal(faq.mainEntity.length, 5, `${locale}: accepted homepage questions`);
    for (const question of faq.mainEntity) {
      assert.ok(content.includes(normalizeText(question.name)), `${locale}: question absent from visible content`);
      assert.ok(content.includes(normalizeText(question.acceptedAnswer.text)), `${locale}: answer absent from visible content`);
    }
  }
});
