# AI Crafters — follow the signal

The accepted English/Hebrew neural homepage has 19 reading beats and is integrated into the main site at `/` and `/he`. The historical `experiments/neural-home` directory is its source location. The main site's build includes the accepted custom AI copy, localized SEO, desktop rendering improvements, vGPU-generated mobile artwork, and contact entrance. The previous Next homepage and the visual comparison viewer are removed. Public deployment status must be verified separately from this source integration.

## Run locally

From the repository root, run the complete site:

```sh
rtk proxy yarn install --frozen-lockfile
rtk npm run dev
```

Open [localhost:3000](http://localhost:3000/) or [Hebrew at /he](http://localhost:3000/he). Installation runs `npm --prefix experiments/neural-home ci --include=dev`. Both root `dev` and `build` run `build:home` first, which invokes `vite build --mode site` and emits indexable English/Hebrew HTML plus assets into ignored `public/_home`. Root `npm run build` followed by `npm start` serves the same homepage. The postbuild step also includes `public` and `.next/static` in the Next standalone output.

Middleware rewrites `/` and `/he` to their built HTML before Next's locale middleware; `/en` redirects permanently to `/`. Service, project, career, legal, and API routes remain in Next. Only one server is needed for the integrated site. While root development is running, homepage source edits require `rtk npm run build:home` and a browser refresh; that source is not watched by the root development command.

### Isolated visual development

For Vite's direct source reload, start a Next server on an available port, then run these commands from `experiments/neural-home`:

```sh
rtk proxy env LOCAL_APP_ORIGIN=http://localhost:3000 npm run dev -- --port 8274 --strictPort
```

For an isolated built preview instead:

```sh
rtk npm run build
rtk proxy env LOCAL_APP_ORIGIN=http://localhost:3000 npm run preview -- --port 8274 --strictPort
```

An ordinary Vite build writes `dist` and retains `noindex,nofollow`; only `build:site` creates the indexable main-site output. The Vite scripts historically default to port 8268, so select an unused port when the complete site is already running there. `LOCAL_APP_ORIGIN` defaults to `http://localhost:8272` when unset. Use the literal `localhost` bind hostname for the installed Next version's locale behavior.

Vite proxies ordinary page/locale routes, assets, `/_next` including WebSockets, and contact/careers APIs to the selected local Next origin. Its own English `/` and `/en`, and pretranslated Hebrew `/he`, stay on that isolated preview. First-party links are root-relative. The language switch preserves query/hash; legacy `#services`, `#work`, and `#about` map to `#agents`, `#results`, and `#team`. Serving `dist` separately still requires equivalent page/API routing; the integrated root build supplies those routes itself. The comparison viewer and combined baseline build are no longer part of this workflow.

## Journey and rendering

The entire homepage uses the accepted curved route and fixed reading panels. Nineteen beats cover introduction, knowledge, capabilities, case studies, process, Saar/Eran, client testimonials, FAQ, and contact. Dvir has been removed from displayed founder content. Desktop retains the `1.35` speed multiplier with 20% reading hold and 80% transition. Mobile uses `1.6875` speed (25% faster) with 40% reading hold and 60% transition, giving each reading hold 60% more scroll distance than before. A scroll unit is stage height times `1.65` below 700px wide, or `1.6` otherwise, divided by the profile's speed multiplier. Chapter jumps land halfway into the reading hold. Hebrew changes content direction only: DOM `data-side`, camera route, and beat mapping are identical to English.

The mobile renderer profile requires a primary coarse pointer and either a physical screen short side of at most 900px or a viewport narrower than 700px. Head preflight selects the profile before paint; a fine-pointer desktop retains Three.js even in a narrow window. Mobile imports only `src/mobile-scene.js` and draws the 2.5D journey and distant field together in `#neural-field`; desktop retains `scene.js` plus `field.js`. The mobile renderer caches neuron/glow sprites, draws a bounded set of nearby checkpoints, and adapts resolution to sustained draw cost. Its single scheduler targets 30fps in travel and 18fps at idle; these cadences are verified with a simulated clock, not measured phone frame rates.

Mobile uses six border-tail segments instead of twenty, removes backdrop blur and expensive card shadows, and caches DOM writes while applying panel transforms/opacity directly. Its stable `100svh` stage supplies journey height so address-bar changes do not repeatedly relayout the route. Profile changes replace/dispose graphics while preserving the current reading/transition phase and manual pause; resize may recalculate the pixel scroll offset. Generation/abort guards, visibility/offscreen/black-stage pause, BFCache handling, and static fallback remain in place. The accepted 19 beats, desktop `.2/.8` pacing and `1.35` speed, content-visible ending, and desktop scene/field modules are unchanged. At the mobile pacing follow-up, all 26 controller tests and the prototype build passed without an additional browser or Lighthouse pass. The September 10 copy checks are recorded separately below.

The initial document contains enhanced/preactive first-beat markup. A head preflight checks motion/viewport eligibility and an eight-second watchdog restores readable fallback if main initialization fails. Main's `journeyReady` is independent of WebGL, so panel scrolling/navigation can start before the renderer is ready. Desktop neural geometry and shader preparation yield in cancellable chunks while retaining the route; a separate 20-second scene-preparation deadline bounds loading. Decorative rendering pauses while the background is fully black and resumes during the fade, as well as respecting manual pause, visibility, and reduced motion.

The distant field has connected lines, moving glows, idle pulses, scroll energy, and a gradual approach. Purple brand accents accompany the cyan/white main signal. Cards retain their internal scroll timelines and four-second signal along the actual rounded border. The first screen keeps a mouse scroll cue. The final contact content fades in while scaling down from 1.18× to 1× around its center. Its footer only fades in and stays anchored. The background starts darkening just before the final transition and reaches black as contact settles; the camera/pulse reaches the last neuron at that same endpoint. Final heading, contact controls, and footer stay visible and interactive on black. The opening still fades only the background.

The existing trust checkpoint contains the three original client testimonials without adding a journey beat. It initializes as the card approaches, previews one change after one second, then rotates every eight seconds while readable. Changes use a 320ms fade and 6px shift; reduced motion makes them instant without disabling autoplay. Explicit carousel Pause and hidden/out-of-range state stop rotation; hover, focus, manual navigation, and global neural Pause do not suppress it. Manual navigation resets the reading interval, inactive slides stay inert, and disposal clears observers/timers.

Larger typography is implemented in `src/readability.css` and independently reviewed: desktop reading areas are 700–778px with 16–18px body text, with modest mobile sizing and bounded short-screen overflow. Earlier EN/HE checks at desktop 1280/1440px and mobile 390/320px found no horizontal overflow. No additional manual visual pass was performed for the final compact refinements; the user explicitly chose to inspect those. The earlier Lighthouse build includes those readability refinements; it predates the mobile-renderer/carousel follow-up.

## Shared pages, branding, and contact

Ordinary Next pages use shared static styles and `SiteContactDialog`, without a neural canvas. Next Footer and prototype HTML share `src/styles/site-footer.css`. The actual logo/favicon are copied unchanged; CSS crops transparent logo padding. Primary navigation uses standalone Use cases/Careers pages. The mobile menu closes on selection, outside click, and Escape with appropriate focus restoration; its journey rail uses eight equal columns above the previous/next and Pause controls.

Contact controls open a localized native dialog using the existing API contract: Name → `firstName`, Company → `lastName`, `email`, `message`, the current `locale`, and `recaptchaToken` from v3 action `contact_submit`. Only the public site key is bundled. Google reCAPTCHA loads on dialog open; `execute` readiness is checked inside `grecaptcha.ready`, with retry after a failed load. Preserve those readiness/race guards, cancellation, duplicate-submit protection, draft retention, timeout handling, and focus restoration. The hidden floating badge is accompanied by visible Google Privacy/Terms disclosure. Local verification failures show honest errors and the real email fallback. Synthetic success/error tests are UI evidence; no real test email or delivery is claimed.

Business copy, metrics, founder details, and all three quotations come from existing site content. Shared static presentation, footer/contact integration, and locale support accompany the integrated homepage. Localized search/social metadata and visible FAQ structured data from the September 10 copy correction are included in the main-site build, where HTML is indexable; isolated Vite previews retain `noindex,nofollow`. The main-site homepage defers the existing Google Ads tag. No private backend credentials are bundled. Contact and secondary-page requests use the same Next origin as the homepage.

## September 10, 2026: copy and conversion correction

The initial content review mistakenly targeted and showed the older Next homepage. The correction applies the custom AI positioning to this accepted neural journey: “Custom AI. Built for you.” in English and “פתרונות AI. בדיוק בשבילכם.” in Hebrew, supported by concise copy about agents, workflows, and product capabilities fitted to the client's systems and data. The hero's primary action opens the existing contact dialog; its secondary case-study link and scroll cue remain. Contact copy explains what to share and what happens next.

Thirteen animation/controller/CSS files match the SHA-256 baseline captured before this correction. The 19 beats, eight chapters, SVGs, renderer behavior, and desktop/mobile pacing are preserved. The final build and all 44 neural tests passed: 39 existing controller, testimonial, and renderer tests plus five localized metadata tests. Independent code review found no actionable issues. Browser checks verified neuron rendering and journey navigation, English/Hebrew heroes and inquiry dialogs, English workflow-card wrapping, and navigation to client projects and back. Checked desktop and 390×844 layouts had no horizontal overflow. The narrow viewport used the desktop renderer; physical-phone/mobile-renderer visual acceptance, fresh Lighthouse results, and actual-phone performance were not measured.

The [content and search review](../../docs/content-seo-review-2026-09-10.md) separates the older live-site Search Console baseline from these changes. In that copy pass, built English/Hebrew HTML was verified for localized search/social metadata and a single FAQ schema block; CSS/JS assets and representative proxied service/use-case pages returned HTTP 200. Those checks used a `noindex,nofollow` preview. The later main-site integration now uses indexable `site` output; the historical copy checks do not establish release or search-index status for that build.

## Historical mobile-renderer and carousel verification

The earlier build, independent mobile/card/integration reviews, and all 49 tests passed: 20 existing tests, 16 mobile-runtime VM tests, six carousel tests, and seven fake-canvas/clock renderer tests. That build's `/` and `/he` preview assets returned HTTP 200 with correct MIME types and no desktop scene/field preload in HTML. In that build, the mobile scene was 7.81kB raw / 3.67kB gzip (`mobile-scene-m-dL43CT.js`); main was 47.09kB / 17.51kB (`index-D0HVJRzX.js`), and CSS was 107.02kB / 19.98kB (`index-DzH0tUzt.css`). Desktop `scene-4T9MWBOL.js` and `field-CsT23Vn8.js` retained their prior hashes; mobile avoided their roughly 141kB combined gzip import. No browser was launched for that follow-up; it did not establish phone visual acceptance. No fresh Lighthouse run or actual-phone FPS result is claimed.

## Earlier Lighthouse verification

The retained audits below cover the earlier assets, before the closing-timing and mobile-renderer/carousel follow-ups. They must not be presented as measurements of the current build.

[The Lighthouse report index](reports/lighthouse/README.md) and [summary](reports/lighthouse/final/summary.json) are the audit source of truth. Lighthouse 13.4.1 used the default simulated mobile profile: 412×823, 4× CPU slowdown, and 150ms RTT against local production-backed previews. These are lab measurements, not physical-device or live PageSpeed Insights results.

| Scope/version | Mobile performance | Evidence |
| --- | --- | --- |
| Initial homepage | 40; LCP 6.42s; TBT 5214ms | Baseline |
| Audited EN homepage | 94 / 99 / 94; median 94 | Three runs on earlier audited assets |
| Audited HE homepage | 95 / 95 / 99; median 95 | Three runs on earlier audited assets |
| All 32 non-home EN/HE routes | 96–99 | One accepted run per route |
| All 34 routes | 94–99 across 38 retained runs | CLS 0 throughout |

All six retained homepage runs use `index-C3t_9s6P.js` and `index-CRFAiRHu.css`, including readability, centered finale, autoplay, and RTL. Audited homepage LCP is 2.11–2.96s and TBT 12–30ms. Accepted runs have no failed resources, incorrect asset MIME types, unexpected redirects, runtime errors, or run warnings; 42 report links were verified. The [pre-readability comparison runs](reports/lighthouse/interim/pre-readability/README.md) and earlier broken-logo diagnostic are retained separately and excluded from final acceptance. An earlier in-app browser check observed no long task over 50ms during first scrolling with the renderer already prepared; this does not measure physical-device GPU/battery or actual OS background behavior.

Earlier browser checks covered shared static pages/footer, contact validation and intercepted synthetic responses, menu/focus behavior, local routes, and the content-visible ending. Their manual visual coverage predates the final compact refinements, which the user will inspect; the retained Lighthouse runs cover the earlier asset hashes listed above. Historical 20-stop, previous pacing, frame-rate, and superseded content-fade evidence remains in `evidence/qa.json`, `evidence/pacing-qa.json`, the fade/approach evidence files, and the design/plan documents. Those results must not be relabeled as new 19-beat or current-typography tests.
