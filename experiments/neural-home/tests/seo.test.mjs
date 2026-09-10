import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHomeSeo } from '../build/seo.js';
import { hebrewCopy, renderLocalizedHome } from '../src/localization.js';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const schema = html => JSON.parse(html.match(/<script id="neural-home-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const graphNode = (html, type) => schema(html)['@graph'].find(node => node['@type'] === type);
const faqKeys = [
  ['questions.offerTitle', 'questions.offer'],
  ['questions.fitTitle', 'questions.fit'],
  ['controls.toolsTitle', 'controls.tools'],
  ['controls.reviewTitle', 'controls.review'],
  ['firstStep.question', 'firstStep.answer'],
];

test('English metadata uses the rendered copy and preserves the entire journey body', () => {
  const rendered = renderLocalizedHome(source, 'en');
  const html = renderHomeSeo(rendered, 'en');
  assert.equal(html.slice(html.indexOf('<body')), rendered.slice(rendered.indexOf('<body')));
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.ai-crafters\.com\/">/);
  assert.match(html, /property="og:locale" content="en_US"/);
  assert.match(html, /name="twitter:card" content="summary"/);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.equal(graphNode(html, 'WebPage').inLanguage, 'en');
  assert.equal(graphNode(html, 'Organization').name, 'AI Crafters');
  assert.equal(graphNode(html, 'WebSite').publisher['@id'], graphNode(html, 'Organization')['@id']);
  const questions = graphNode(html, 'FAQPage').mainEntity;
  assert.equal(questions.length, 5);
  for (const [index, [questionKey, answerKey]] of faqKeys.entries()) {
    const question = rendered.match(new RegExp(`<summary data-i18n="${questionKey}">([^<]+)<span`))[1];
    const answer = rendered.match(new RegExp(`<p data-i18n="${answerKey}">([^<]+)<\/p>`))[1];
    assert.equal(questions[index].name, question);
    assert.equal(questions[index].acceptedAnswer.text, answer);
  }
});

test('Hebrew metadata and all five FAQ answers follow the server-rendered translation', () => {
  const localized = renderLocalizedHome(source, 'he');
  const html = renderHomeSeo(localized, 'he');
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.ai-crafters\.com\/he">/);
  assert.match(html, /property="og:locale" content="he_IL"/);
  assert.match(html, /property="og:locale:alternate" content="en_US"/);
  const page = graphNode(html, 'WebPage');
  assert.equal(page.name, hebrewCopy['meta.title']);
  assert.equal(page.description, hebrewCopy['meta.description']);
  assert.equal(page.inLanguage, 'he');
  assert.equal(page.url, 'https://www.ai-crafters.com/he');
  assert.equal(html.slice(html.indexOf('<body')), localized.slice(localized.indexOf('<body')));
  const questions = graphNode(html, 'FAQPage').mainEntity;
  for (const [index, [questionKey, answerKey]] of faqKeys.entries()) {
    assert.equal(questions[index].name, hebrewCopy[questionKey]);
    assert.equal(questions[index].acceptedAnswer.text, hebrewCopy[answerKey]);
  }
});

test('the build can localize already-decorated English HTML without stale or duplicate metadata', () => {
  const english = renderHomeSeo(renderLocalizedHome(source, 'en'), 'en');
  const hebrew = renderHomeSeo(renderLocalizedHome(english, 'he'), 'he');
  const repeated = renderHomeSeo(hebrew, 'he');
  assert.equal(repeated, hebrew);
  for (const html of [english, hebrew, repeated]) {
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/property="og:title"/g) || []).length, 1);
    assert.equal((html.match(/name="twitter:title"/g) || []).length, 1);
    assert.equal((html.match(/id="neural-home-schema"/g) || []).length, 1);
    assert.equal((html.match(/name="robots"/g) || []).length, 1);
    for (const locale of ['en', 'he', 'x-default']) {
      assert.equal((html.match(new RegExp(`<link rel="alternate" hreflang="${locale}"`, 'g')) || []).length, 1);
    }
    assert.match(html, /name="robots" content="noindex, nofollow"/);
  }
  assert.equal(graphNode(repeated, 'WebPage').name, hebrewCopy['meta.title']);
  assert.equal(graphNode(repeated, 'FAQPage').mainEntity[0].name, hebrewCopy['questions.offerTitle']);
});

test('FAQ text is read from visible content, decodes entities, and cannot close its JSON script', () => {
  const copy = source
    .replace(/(<summary data-i18n="questions.offerTitle">)[\s\S]*?(<\/summary>)/,
      '$1What &amp; why?<span aria-hidden="true">+</span>$2')
    .replace(/(<p data-i18n="questions.offer">)[\s\S]*?(<\/p>)/,
      '$1Use &quot;approved&quot; sources<br>with &#39;review&#39; &#x26; &lt;/script&gt; text.<span aria-hidden="true">DECORATION</span>$2');
  const html = renderHomeSeo(copy, 'en');
  const question = graphNode(html, 'FAQPage').mainEntity[0];
  assert.equal(question.name, 'What & why?');
  assert.equal(question.acceptedAnswer.text, 'Use "approved" sources with \'review\' & </script> text.');
  const json = html.match(/<script id="neural-home-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.ok(!json.includes('<'));
  assert.ok(json.includes('\\u003c/script>'));
});

test('missing visible answers fail the build instead of publishing invented or incomplete FAQ copy', () => {
  assert.throws(() => renderHomeSeo(source.replace('data-i18n="controls.tools"', 'data-removed="controls.tools"')), /Missing neural homepage SEO content: controls.tools/);
  assert.throws(() => renderHomeSeo(source, 'fr'), /Unsupported homepage locale/);
  assert.throws(() => renderHomeSeo(source.replace(/<title[\s\S]*?<\/title>/, '')), /Missing neural homepage title or description/);
});
