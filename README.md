<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Crafters Landing Page

The English and Hebrew homepage is the accepted neural journey, including the custom AI copy, localized SEO, vGPU-generated mobile artwork, and contact transitions. Next.js 16 serves it at `/` and `/he` alongside the existing service, project, career, legal, and API routes.

## Run Locally

**Prerequisites:** Node.js 22.12+, npm 10+, and Yarn Classic for the root lockfile.

```sh
yarn install --frozen-lockfile
npm run dev
```

Open [English](http://localhost:3000/) or [Hebrew](http://localhost:3000/he). Installation also installs the homepage's locked dependencies. The development command builds the homepage before starting Next; only one server is required.

Homepage source remains in `experiments/neural-home` under its historical directory name. After editing that source while Next is running, run `npm run build:home` and refresh the page. The root development command does not watch the homepage source. Other Next pages retain their normal development reload behavior.

## Production Build

```sh
npm run build
npm start
```

The build first runs Vite in `site` mode and writes the bilingual homepage and assets to ignored `public/_home`. Middleware serves that output at `/` and `/he` before locale handling; `/en` redirects permanently to `/`. Production homepage HTML is indexable and includes localized metadata and structured data. The previous Next homepage route and the visual comparison viewer are removed.

Next builds the remaining routes and APIs. The postbuild step copies `public` and `.next/static` into `.next/standalone`, so `node .next/standalone/server.js` can also serve the complete build. Keep the existing contact email and CAPTCHA environment settings; only the public CAPTCHA key is included in homepage assets. The homepage defers the existing Google Ads tag.

See the [homepage guide](experiments/neural-home/README.md) for rendering and isolated visual development, the [copy and SEO review](docs/content-seo-review-2026-09-10.md) for content decisions, and the [historical rendering results](tools/render-benchmark/RESULTS.md) for version-specific measurements. These source and build instructions do not establish the status of a public deployment.
