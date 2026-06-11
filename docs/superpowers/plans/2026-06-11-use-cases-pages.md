# Use Cases Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localized `/use-cases` overview page and detail pages for each AI Crafters use case from the supplied PDFs.

**Architecture:** Store all use case content in a typed data module with localized fields, then render overview and detail pages from reusable components. Use static params for detail routes and `notFound()` for unknown slugs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next-intl`, Tailwind CSS, lucide-react.

---

## File Structure

- Create `src/content/useCases.ts`: typed localized content and helper functions.
- Create `src/components/use-cases/UseCasesOverview.tsx`: overview page UI.
- Create `src/components/use-cases/UseCaseDetail.tsx`: detail page UI.
- Create `src/app/[locale]/use-cases/page.tsx`: localized overview route.
- Create `src/app/[locale]/use-cases/[slug]/page.tsx`: localized detail route.
- Modify `src/components/Navbar.tsx`: add `Use Cases` nav link.
- Modify `messages/en.json` and `messages/he.json`: add nav label.

## Tasks

### Task 1: Create Use Case Content Model

**Files:**
- Create: `src/content/useCases.ts`

- [ ] **Step 1: Add localized use case types and data**

Create a module exporting:

```ts
export type LocaleKey = 'en' | 'he';

export type UseCase = {
  slug: string;
  status: Record<LocaleKey, string>;
  valueTheme: Record<LocaleKey, string>;
  title: Record<LocaleKey, string>;
  client: Record<LocaleKey, string>;
  eyebrow: Record<LocaleKey, string>;
  metric: Record<LocaleKey, string>;
  metricDetail: Record<LocaleKey, string>;
  summary: Record<LocaleKey, string>;
  problem: Record<LocaleKey, string>;
  built: Record<LocaleKey, string[]>;
  impact: Record<LocaleKey, string>;
  proof: Record<LocaleKey, string[]>;
};
```

Include five detail use cases and overview copy derived from the PDFs.

- [ ] **Step 2: Add helpers**

Export `getUseCases(locale)`, `getUseCase(slug, locale)`, `getRelatedUseCases(slug, locale)`, and `useCaseSlugs`.

### Task 2: Build Overview UI

**Files:**
- Create: `src/components/use-cases/UseCasesOverview.tsx`
- Create: `src/app/[locale]/use-cases/page.tsx`

- [ ] **Step 1: Render overview hero**

Use the content module to display title, intro, and proof points.

- [ ] **Step 2: Render card grid**

Each card links to `/use-cases/[slug]`, shows status, client, metric, summary, and value theme.

- [ ] **Step 3: Add metadata**

Export localized metadata from the route using the content module.

### Task 3: Build Detail UI

**Files:**
- Create: `src/components/use-cases/UseCaseDetail.tsx`
- Create: `src/app/[locale]/use-cases/[slug]/page.tsx`

- [ ] **Step 1: Add static params**

Generate params for all slugs and locales.

- [ ] **Step 2: Render detail page**

Show hero, problem, what we built, business impact, proof strip, related use cases, and contact CTA.

- [ ] **Step 3: Handle unknown slugs**

Call `notFound()` if a slug is missing.

### Task 4: Add Navigation

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `messages/en.json`
- Modify: `messages/he.json`

- [ ] **Step 1: Add translation keys**

Add `nav.useCases` in English and Hebrew.

- [ ] **Step 2: Add nav link**

Insert the link near `Projects`, using localized route behavior.

### Task 5: Verify

**Files:**
- No source changes expected.

- [ ] **Step 1: Run build**

Run `yarn build`.

- [ ] **Step 2: Run local server**

Run `yarn dev` on an available port.

- [ ] **Step 3: Browser check**

Open the overview and detail pages in English and Hebrew, including mobile width, and verify layout and navigation.

