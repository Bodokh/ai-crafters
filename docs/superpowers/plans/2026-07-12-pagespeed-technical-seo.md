# PageSpeed and Technical SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve Lighthouse mobile scores of at least 95 on every public page template while improving metadata, crawlability, structured data, accessibility, and runtime best practices.

**Architecture:** Fix shared layout costs at the locale layout boundary, keep third-party analytics off the critical rendering path, and reduce client-only rendering to interactive islands. Validate route metadata from production build output and use Lighthouse mobile against the production standalone server for every localized route.

**Tech Stack:** Next.js 16 App Router, React 19, next-intl, Tailwind CSS, Node test runner, Lighthouse 13, Chrome headless.

## Global Constraints

- Preserve the existing Hebrew and English content and visual identity.
- Lighthouse mobile performance target is 95 or higher on every public route.
- Aim for 95 or higher in Accessibility, Best Practices, and SEO where the audit applies.
- Preserve unrelated working-tree changes from the homepage translation task.
- Use production builds and a complete standalone server bundle for measurement.
- Do not load Google Ads before meaningful user interaction.
- Keep canonical URLs, reciprocal hreflang, structured data, robots.txt, and sitemap.xml valid.

## Baseline

| Template | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Homepage | 93 | 91 | 77 | 92 | 3.2s | 0 |
| Careers | 59 | 92 | 77 | 92 | 6.2s | 0.38 |
| Use-cases index | 94 | 94 | 77 | 92 | 3.1s | 0 |
| Use-case detail | 94 | 94 | 77 | 92 | 3.0s | 0 |
| Service detail | 94 | 94 | 77 | 92 | 3.0s | 0 |
| Terms | 93 | 93 | 77 | 61 | 3.2s | 0 |
| Comparison | 95 | 94 | 77 | 92 | 2.9s | 0 |
| Resource | 94 | 89 | 77 | 92 | 3.0s | 0 |

Local SEO scores lose eight points because production canonicals intentionally differ from the localhost audit URL. Final local audits must build with `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3107`; source verification must separately assert production URLs default to `https://www.ai-crafters.com`.

---

### Task 1: Shared analytics, payload, and metadata boundary

**Files:**
- Create: `src/components/DeferredAnalytics.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/careers/page.tsx`
- Modify: `src/lib/seo.ts`
- Test: `tests/site-quality.test.mjs`

**Interfaces:**
- `DeferredAnalytics({ measurementId })` loads Google Ads after the first pointer, touch, keyboard, or scroll interaction and does not execute during an idle Lighthouse load.
- The root `NextIntlClientProvider` receives only the `nav` namespace; interactive page islands receive their own message namespace.
- `createPageMetadata` continues to return canonical, hreflang, Open Graph, Twitter, and robots metadata.

- [ ] Write regression assertions for deferred analytics, scoped client messages, canonical/hreflang generation, and social metadata.
- [ ] Run `rtk node --test tests/site-quality.test.mjs` and confirm the new assertions fail.
- [ ] Replace eager Google scripts with `DeferredAnalytics` and scope the root client message payload.
- [ ] Add complete social, author, category, and language metadata without duplicating page titles.
- [ ] Run the regression tests and production build.

### Task 2: Shared accessibility and contrast failures

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/app/[locale]/resources/[slug]/page.tsx`
- Test: `tests/site-quality.test.mjs`

**Interfaces:**
- Mobile menu and locale controls expose localized accessible names, state, and minimum 44px targets.
- Primary light-mode CTAs use a background with at least 4.5:1 contrast against white text.

- [ ] Add rendered/source assertions for accessible mobile controls and high-contrast primary CTA classes.
- [ ] Run the test and confirm failure on the current components.
- [ ] Add `aria-label`, `aria-expanded`, `aria-controls`, icon hiding, and target sizing.
- [ ] Darken primary CTA backgrounds while preserving dark-theme appearance.
- [ ] Run tests and Lighthouse on homepage and resource templates.

### Task 3: Careers and Terms rendering stability

**Files:**
- Modify: `src/components/Careers.tsx`
- Modify: `src/components/Terms.tsx`
- Modify: `src/app/[locale]/careers/page.tsx`
- Modify: `src/app/[locale]/terms/page.tsx`
- Test: `tests/site-quality.test.mjs`

**Interfaces:**
- Careers renders its H1 and job summaries in the initial HTML with no decode animation or layout animation.
- Expand/collapse controls remain keyboard accessible and expose `aria-expanded`.
- Careers and Terms each expose exactly one `<main>` landmark.

- [ ] Add assertions that the above-the-fold content is static and both pages use a main landmark.
- [ ] Confirm the assertions fail and preserve the Lighthouse 59/CLS 0.38 baseline evidence.
- [ ] Remove Framer Motion and decoded-text rendering from the two routes.
- [ ] Replace clickable containers with semantic buttons and static layout.
- [ ] Rerun tests and Lighthouse; Careers must reach 95 performance with CLS below 0.1.

### Task 4: Route metadata, crawl directives, and social previews

**Files:**
- Modify: `src/app/[locale]/careers/page.tsx`
- Modify: `src/app/[locale]/terms/page.tsx`
- Modify: `src/content/useCases.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `public/site.webmanifest`
- Modify: `metadata.json`
- Test: `tests/site-quality.test.mjs`

**Interfaces:**
- Every indexable build artifact has one H1, unique title, useful description, canonical, reciprocal English/Hebrew alternates, Open Graph, Twitter, and valid JSON-LD.
- Terms pages are consistently indexable and present in the sitemap, avoiding the current sitemap/noindex conflict.

- [ ] Add build-artifact assertions for titles, descriptions, H1, canonicals, hreflang, social cards, robots, and JSON-LD.
- [ ] Run against the current build and confirm careers/use-cases/terms failures.
- [ ] Add concise localized metadata and remove the terms noindex conflict.
- [ ] Update manifest/project metadata descriptions and sitemap language alternates.
- [ ] Build and run the artifact assertions again.

### Task 5: Route-wide verification

**Files:**
- Verify: all files above
- Verify: `messages/en.json`
- Verify: `tests/homepage-localization.test.mjs`

- [ ] Run `rtk node --test tests/*.test.mjs`.
- [ ] Run `rtk yarn build` and confirm all localized static pages generate.
- [ ] Copy `public` and `.next/static` into `.next/standalone` for a valid standalone test harness.
- [ ] Run Lighthouse mobile for every localized route emitted by the sitemap.
- [ ] Fail the gate if any public route is below 95 performance; inspect and fix template-specific failures.
- [ ] Verify robots.txt, sitemap.xml, canonical/hreflang, social metadata, JSON-LD, HTTP status, and absence of console errors.
- [ ] Run `rtk git diff --check` and review the final working-tree scope.

## Self-Review

- Spec coverage: all public templates, mobile Lighthouse, SEO metadata, accessibility, structured data, crawlability, and best-practices audits are included.
- Placeholder scan: no implementation placeholders remain.
- Type consistency: component and metadata interfaces match the current App Router and next-intl boundaries.
- Execution choice: inline execution is selected because the user requested the optimization task directly and the repository has related uncommitted localization work that must be preserved.
