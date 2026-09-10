const siteUrl = 'https://www.ai-crafters.com';
const imageUrl = `${siteUrl}/images/og-image.jpg`;
const ogImageAlt = locale =>
  locale === 'he'
    ? 'AI Crafters — פתרונות AI. בדיוק בשבילכם.'
    : 'AI Crafters — Custom AI. Built for you.';
const faqKeys = [
  ['questions.offerTitle', 'questions.offer'],
  ['questions.fitTitle', 'questions.fit'],
  ['controls.toolsTitle', 'controls.tools'],
  ['controls.reviewTitle', 'controls.review'],
  ['firstStep.question', 'firstStep.answer'],
];
const metadataBlock = /\n?\s*<!-- neural-seo:start -->[\s\S]*?<!-- neural-seo:end -->/g;
const robotsMeta = /\n?\s*<meta\b(?=[^>]*\sname\s*=\s*(?:"robots"|'robots'|robots(?=\s|\/?>)))[^>]*>/gi;

const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeAttribute = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function decodeEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code) => {
    if (!code.startsWith('#')) return named[code.toLowerCase()];
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point)
      : '\ufffd';
  });
}

// These are explicit hooks in our controlled HTML template, not arbitrary HTML.
// Keep FAQ copy derived from its rendered, localized answer rather than a second
// manually maintained content dictionary.
function visibleText(fragment) {
  return decodeEntities(fragment
    .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<([a-z][\w-]*)\b[^>]*\baria-hidden\s*=\s*["']true["'][^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ''))
    .replace(/\s+/gu, ' ')
    .trim();
}

function contentAt(html, key) {
  const pattern = new RegExp(`<([a-z][\\w-]*)\\b(?=[^>]*\\bdata-i18n=["']${escapePattern(key)}["'])[^>]*>([\\s\\S]*?)<\\/\\1\\s*>`, 'i');
  const match = html.match(pattern);
  if (!match || !visibleText(match[2])) throw new Error(`Missing neural homepage SEO content: ${key}`);
  return visibleText(match[2]);
}

/** Add localized metadata; previews remain private unless the build opts in. */
export function renderHomeSeo(html, locale = 'en', { indexable = false } = {}) {
  if (locale !== 'en' && locale !== 'he') throw new Error(`Unsupported homepage locale: ${locale}`);
  const cleanHtml = html.replace(metadataBlock, '').replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/i,
    head => head.replace(robotsMeta, ''));
  if (!/<\/head\s*>/i.test(cleanHtml)) throw new Error('Missing neural homepage head');
  const title = visibleText(cleanHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] || '');
  const descriptionTag = cleanHtml.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i)?.[0];
  const description = decodeEntities(descriptionTag?.match(/\bcontent="([^"]*)"/i)?.[1] || '').trim();
  if (!title || !description) throw new Error('Missing neural homepage title or description');
  const canonical = `${siteUrl}${locale === 'he' ? '/he' : '/'}`;
  const mainEntity = faqKeys.map(([question, answer]) => ({
    '@type': 'Question',
    name: contentAt(cleanHtml, question),
    acceptedAnswer: { '@type': 'Answer', text: contentAt(cleanHtml, answer) },
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'AI Crafters',
        url: `${siteUrl}/`,
        logo: imageUrl,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'AI Crafters',
        url: `${siteUrl}/`,
        inLanguage: ['en', 'he'],
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
        hasPart: { '@id': `${canonical}#faq` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        inLanguage: locale,
        isPartOf: { '@id': `${canonical}#webpage` },
        mainEntity,
      },
    ],
  };
  const meta = (attribute, name, content) => `<meta ${attribute}="${name}" content="${escapeAttribute(content)}">`;
  const additions = [
    '<!-- neural-seo:start -->',
    meta('name', 'robots', indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'),
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="alternate" hreflang="en" href="${siteUrl}/">`,
    `<link rel="alternate" hreflang="he" href="${siteUrl}/he">`,
    `<link rel="alternate" hreflang="x-default" href="${siteUrl}/">`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'AI Crafters'),
    meta('property', 'og:url', canonical),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:locale', locale === 'he' ? 'he_IL' : 'en_US'),
    meta('property', 'og:locale:alternate', locale === 'he' ? 'en_US' : 'he_IL'),
    meta('property', 'og:image', imageUrl),
    meta('property', 'og:image:type', 'image/jpeg'),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', ogImageAlt(locale)),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', imageUrl),
    meta('name', 'twitter:image:alt', ogImageAlt(locale)),
    `<script id="neural-home-schema" type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
    '<!-- neural-seo:end -->',
  ].join('\n    ');
  return cleanHtml.replace(/<\/head\s*>/i, `${additions}\n  </head>`);
}
