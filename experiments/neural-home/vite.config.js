import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { renderLocalizedHome } from './src/localization.js';
import { renderHomeSeo } from './build/seo.js';

export default defineConfig(({ mode }) => {
  const productionHome = mode === 'site';
  // Share the existing app's public captcha key; private credentials stay in Next.
  const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
  const env = loadEnv(mode, repoRoot, 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
  const localizeHome = (html, locale) => {
    const localized = renderHomeSeo(renderLocalizedHome(html, locale), locale, { indexable: productionHome });
    // This preload is added after Vite rewrites the template's other asset URLs.
    return productionHome ? localized.replaceAll('href="/rubik-hebrew.woff2"', 'href="/_home/rubik-hebrew.woff2"') : localized;
  };
  const localApp = {
    target: process.env.LOCAL_APP_ORIGIN || 'http://localhost:8272',
    // Preserve this preview's origin for Next's locale redirects.
    changeOrigin: false,
    timeout: 60_000,
    proxyTimeout: 60_000,
  };
  const localRoutes = [
    '^/(?:(?:en|he)/)?(?:careers|terms|use-cases(?:/[^/?]+)?|(?:services|resources|compare)/[^/?]+)/?(?:\\?.*)?$',
    '^/images/',
    '^/(?:favicon\\.ico|favicon\\.svg|favicon-96x96\\.png|apple-touch-icon\\.png|site\\.webmanifest|web-app-manifest-(?:192x192|512x512)\\.png)(?:\\?.*)?$',
    '^/api/(?:contact|careers)(?:\\?.*)?$',
  ];
  const proxy = Object.fromEntries(localRoutes.map(route => [route, { ...localApp }]));
  proxy['^/_next(?:/|\\?|$)'] = { ...localApp, ws: true };

  // Keep the locale URL visible. Preview serves pretranslated HTML; the dev
  // server renders the same explicit copy through transformIndexHtml.
  const usePrototypeHome = preview => server => {
    server.middlewares.use((request, _response, next) => {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      if (!/^\/(?:en|he)\/?$/.test(url.pathname)) return next();
      request.originalUrl ||= request.url;
      request.url = `${preview && url.pathname.startsWith('/he') ? '/he/index.html' : '/index.html'}${url.search}`;
      next();
    });
  };
  const localePlugin = {
    name: 'local-site-home',
    configureServer: usePrototypeHome(false),
    configurePreviewServer: usePrototypeHome(true),
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        const path = context.originalUrl || context.path;
        const locale = /^\/he(?:[/?]|$)/.test(path) ? 'he' : 'en';
        return localizeHome(html, locale);
      },
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const home = bundle['index.html'];
        if (home?.type === 'asset') {
          this.emitFile({ type: 'asset', fileName: 'he/index.html', source: localizeHome(String(home.source), 'he') });
        }
      },
    },
  };

  return {
    base: productionHome ? '/_home/' : '/',
    build: productionHome ? { outDir: fileURLToPath(new URL('../../public/_home/', import.meta.url)), emptyOutDir: true } : {},
    plugins: [
      ...(productionHome ? [{
        name: 'site-analytics',
        transformIndexHtml: {
          order: 'pre',
          handler: html => html.replace('</body>', '<script type="module" src="/src/site-analytics.js"></script>\n</body>'),
        },
      }] : []),
      localePlugin,
    ],
    define: {
      'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(siteKey),
    },
    server: { proxy, allowedHosts: ['eran.devshift.biz', 'filler.devshift.biz'] },
    preview: { proxy, allowedHosts: ['eran.devshift.biz', 'filler.devshift.biz'] },
  };
});
