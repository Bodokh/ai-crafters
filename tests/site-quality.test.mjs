import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const sources = Object.fromEntries(
  await Promise.all(
    [
      'src/app/[locale]/layout.tsx',
      'src/app/[locale]/careers/page.tsx',
      'src/app/[locale]/terms/page.tsx',
      'src/app/[locale]/resources/[slug]/page.tsx',
      'src/app/sitemap.ts',
      'src/components/Navbar.tsx',
      'src/components/Hero.tsx',
      'src/components/Contact.tsx',
      'src/components/Careers.tsx',
      'src/components/ApplicationDialog.tsx',
      'src/components/Terms.tsx',
      'src/styles/site.css',
      'src/styles/site-shell.css',
      'src/proxy.ts',
      'src/lib/seo.ts',
      'public/site.webmanifest',
      'metadata.json',
      'next.config.ts',
    ].map(async (path) => [path, await read(path)]),
  ),
);

test('third-party analytics stays off the initial rendering path', () => {
  const layout = sources['src/app/[locale]/layout.tsx'];
  assert.doesNotMatch(layout, /googletagmanager|google-analytics/);
  assert.match(layout, /<DeferredAnalytics measurementId=/);
});

test('the root client provider serializes only shared navigation and contact messages', () => {
  const layout = sources['src/app/[locale]/layout.tsx'];
  const payload = layout.match(/<NextIntlClientProvider\b[^>]*messages=\{\{([\s\S]*?)\}\}/)?.[1];
  assert.ok(payload, 'The shared provider must use an explicit message subset.');
  assert.deepEqual(
    payload.split(',').map((entry) => entry.replace(/\s/g, '')).filter(Boolean).sort(),
    ['contact:messages.contact', 'nav:messages.nav'],
  );
});

test('navigation exposes named controls, synchronized menu state, and 44px minimum-height rules', () => {
  const navbar = sources['src/components/Navbar.tsx'];
  assert.match(navbar, /aria-label=\{[^}]*language/i);
  assert.match(navbar, /aria-label=\{[^}]*menu/i);
  assert.match(navbar, /aria-expanded=\{isMobileMenuOpen\}/);
  const controlledId = navbar.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(controlledId, 'The menu toggle must identify the navigation it controls.');
  const navigation = [...navbar.matchAll(/<nav\b[^>]*>/g)]
    .map(([tag]) => tag).find((tag) => tag.includes(`id="${controlledId}"`));
  assert.ok(navigation, 'The controlled mobile navigation must exist.');
  assert.match(navigation, /hidden=\{!isMobileMenuOpen\}/);
  assert.match(navbar, /path:\s*['"]\/use-cases['"]/);
  assert.match(navbar, /path:\s*['"]\/careers['"]/);
  assert.doesNotMatch(navbar, /https?:\/\/|href=["'][^"']*#/);
  assert.match(navbar, /<ContactButton\b/);
  const shellRules = [...sources['src/styles/site-shell.css'].matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  for (const selector of ['.aic-header__language', '.aic-header__menu-toggle', '.aic-header .aic-header__contact', '.aic-header__mobile-nav > a']) {
    const heights = shellRules
      .filter(([, selectors]) => selectors.split(',').some((value) => value.trim() === selector))
      .flatMap(([, , declarations]) => [...declarations.matchAll(/min-height:\s*([\d.]+)px/g)])
      .map(([, height]) => Number(height));
    assert.ok(heights.length && heights.every((height) => height >= 44), `${selector} must preserve at least 44px target height.`);
  }
});

test('primary calls to action maintain readable contrast across the shared gradient', () => {
  const css = sources['src/styles/site.css'];
  const buttonRule = css.match(/\.aic-button\s*\{([^}]+)\}/)?.[1];
  assert.ok(buttonRule, 'Shared primary button styling must be present.');
  const foreground = buttonRule.match(/(?:^|;)\s*color:\s*(#[\da-f]{6})\s*;/i)?.[1];
  const gradient = buttonRule.match(/background:\s*linear-gradient\(([^;]+)\);/)?.[1];
  assert.ok(foreground && gradient, 'The primary button must define text and gradient colors.');
  const stops = gradient.match(/#[\da-f]{6}\b/gi) ?? [];
  assert.ok(stops.length >= 2, 'The primary button must have a color gradient.');
  const rgb = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const luminance = (channels) => channels
    .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const textLuminance = luminance(rgb(foreground));
  for (let index = 1; index < stops.length; index++) {
    const from = rgb(stops[index - 1]);
    const to = rgb(stops[index]);
    for (let step = 0; step <= 20; step++) {
      const backgroundLuminance = luminance(from.map((value, channel) => value + (to[channel] - value) * step / 20));
      const contrast = (Math.max(textLuminance, backgroundLuminance) + .05)
        / (Math.min(textLuminance, backgroundLuminance) + .05);
      assert.ok(contrast >= 4.5, `Button contrast is ${contrast.toFixed(2)}:1 between ${stops[index - 1]} and ${stops[index]}.`);
    }
  }
});

test('careers renders stable content with semantic disclosure controls', () => {
  const careers = sources['src/components/Careers.tsx'];
  assert.doesNotMatch(careers, /framer-motion|DecodedText|setInterval/);
  assert.match(careers, /<main\b/);
  assert.match(careers, /aria-expanded=\{isExpanded\}/);
  assert.match(careers, /aria-controls=\{`job-/);
});

test('terms renders as static content inside a main landmark', () => {
  const terms = sources['src/components/Terms.tsx'];
  assert.doesNotMatch(terms, /'use client'|framer-motion|<motion\./);
  assert.match(terms, /<main\b/);
});

test('shared metadata includes production canonicals and complete social identity', () => {
  const seo = sources['src/lib/seo.ts'];
  assert.match(seo, /https:\/\/www\.ai-crafters\.com/);
  assert.match(seo, /authors:/);
  assert.match(seo, /creator:/);
  assert.match(seo, /publisher:/);
  assert.match(seo, /alternateLocale:/);
});

test('terms crawl directives agree with its sitemap inclusion', () => {
  assert.doesNotMatch(sources['src/app/[locale]/terms/page.tsx'], /index:\s*false/);
  assert.match(sources['src/app/sitemap.ts'], /localizedEntries\('\/terms'/);
});

test('manifest and project metadata describe the current AI business', () => {
  const manifest = JSON.parse(sources['public/site.webmanifest']);
  const projectMetadata = JSON.parse(sources['metadata.json']);
  assert.match(manifest.description, /AI agents/i);
  assert.match(projectMetadata.description, /AI agents/i);
  assert.doesNotMatch(projectMetadata.description, /animated landing page/i);
});

test('the locale proxy uses one non-overlapping page matcher', () => {
  const proxy = sources['src/proxy.ts'];
  assert.doesNotMatch(proxy, /'\/'\s*,|'\/\(he\|en\)/);
  assert.match(proxy, /\(\?!api\|_next\|_vercel/);
});

test('Next.js applies baseline security and privacy headers', () => {
  const config = sources['next.config.ts'];
  assert.match(config, /poweredByHeader: false/);
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /X-Frame-Options/);
  assert.match(config, /Referrer-Policy/);
  assert.match(config, /Permissions-Policy/);
});
