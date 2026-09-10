# Neural Homepage Prototype Implementation Plan

Current scope: the bilingual 19-beat preview runs at `http://localhost:8268`, with pretranslated `/he` and the existing Next production app at `localhost:8273` selected through `LOCAL_APP_ORIGIN`. Vite's default app target remains `localhost:8272` for development. The exact public host `eran.devshift.biz` is allowed and returned HTTP 200. An isolated `127.0.0.1:8274` preview is used for audits. See the prototype README for both server commands.

Historical Lighthouse 13.4.1 acceptance used default simulated mobile (412×823, 4× CPU, 150ms RTT) on `index-C3t_9s6P.js` / `index-CRFAiRHu.css`, before the later closing-timing and mobile-renderer/carousel changes. The current follow-up has not been reaudited. All 34 routes pass at 94–99 across 38 retained runs, with CLS 0 throughout. EN homepage scores are 94/99/94 (median 94); HE scores are 95/95/99 (median 95); all 32 non-home routes score 96–99. Homepage LCP is 2.11–2.96s and TBT 12–30ms, versus baseline 6.42s/5214ms and score 40. No failed assets, wrong asset MIME types, unexpected redirects, runtime errors, or run warnings occurred. `experiments/neural-home/reports/lighthouse/README.md` and `final/summary.json` contain the accepted reports; the report links were checked. Pre-readability and broken-logo diagnostic runs remain excluded from final acceptance. These are local production-build lab results, not physical-device or live PageSpeed measurements.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the authorized pinned neural homepage with 19 fixed reading stops, a curved camera route, and the full source-based content across eight chapter groups.

**Architecture:** Native scroll drives a pinned 19-beat timeline using `(1.6 / 1.35) × viewport height` per desktop unit or `(1.65 / 1.35) × viewport height` per mobile unit, with 20% reading hold and 80% transit. Main owns the single eased transition and navigation lands at `openingLength + destinationBeat + 0.1` scroll units; earlier scene legs follow directly without an extra hold/easing curve, and the last camera/signal leg extends through the closing background fade while final content remains visible. Desktop keeps the existing Three.js/2D layers; the coarse-pointer mobile profile uses one Canvas 2D 2.5D renderer. Static fallbacks remain part of the architecture.

**Tech Stack:** Vanilla JavaScript, CSS, HTML, Vite `8.2.2`, Three.js `0.185.1`.

**Spec:** `docs/superpowers/specs/2026-09-08-neural-home-prototype-design.md`

**Current status:** Separate mobile 2.5D rendering and the animated testimonial follow-up are complete, built, independently reviewed, and covered by all 49 passing tests. Desktop scene/field hashes, 19 beats, accepted pacing, localized contact guards, and the visible final contact remain intact. The user will inspect phone visuals; no browser or Lighthouse run was performed for this follow-up. Earlier lab acceptance remains historical and asset-specific.

## Global Constraints

- Keep neural presentation changes in `experiments/neural-home/` and these design/plan documents. The user also authorized main-site founder removal and shared static-page/footer/contact-shell design alignment, including the development-origin setting. Preserve unrelated production work; no commits or deployment.
- Use Vite `8.2.2` and Three.js `0.185.1`, pinned exactly in the experiment's own `package.json`.
- Serve English and pretranslated Hebrew in dark mode; RTL affects reading content only, with identical 19-beat sides/camera mapping. Light mode is outside this task.
- In enhanced mode, pin the viewport and present 19 fixed reading stops across eight chapter groups; native wheel/scroll input controls the finite timeline.
- Use one scroll unit per stop: `(1.6 × viewport height) / 1.35` on desktop and `(1.65 × viewport height) / 1.35` on mobile, with 20% reading hold and 80% transit.
- Navigation lands at `openingLength + destinationBeat + 0.1` scroll units, halfway through the destination reading hold; the scene follows main's eased transition without an extra station hold or second easing curve.
- Use static normal document flow only for reduced motion, no JavaScript, scene error, or viewport height at or below 500 CSS pixels.
- Keep the desktop Three.js scene and separate 2D field; the coarse-pointer mobile profile uses one Canvas 2D 2.5D renderer. Both cover the complete enhanced journey, including FAQ and contact.
- Use `public/neural-poster.webp`, a 1408×880 capture of both actual visual layers without DOM copy, as the immediate static background.
- Reduced motion retains the static composition and all readable content without fetching a neural renderer module.
- Pause the selected renderer(s) while fully black, manually paused, hidden, or offscreen. Revealed idle rendering remains bounded; content readiness is independent of graphics readiness.
- Load visual assets, animation modules, and poster locally. The authorized contact dialog loads Google reCAPTCHA only on open and sends the existing form contract to the existing local Next `/api/contact` backend through Vite to `LOCAL_APP_ORIGIN` (current production app `localhost:8273`, default development app `localhost:8272`); local pages/assets and careers API use the same app. No new backend/provisioning.
- No analytics, fake submissions, fabricated customer claims, or invented performance scores.
- Provide chapter anchors, previous/next stop controls, and the verified `mailto:automate@ai-crafters.com`; copy and claims must come from existing site content.

---

## Ownership and dependencies

The HTML/CSS worker owns `index.html` and `src/styles.css`. The scene worker owns `src/scene.js`. Root owns `src/main.js`, the added `src/field.js`, package/lock files, `public/neural-poster.webp`, `README.md`, integration, and QA. The documentation worker owns only this plan and its spec. All workers preserve other contributors' edits.

The worker outputs and both visual layers are integrated. Current documentation is owned by the docs worker; the audit worker owns `experiments/neural-home/reports/lighthouse/` and the readability worker owns its CSS. Preserve their parallel changes. `evidence/pacing-qa.json` records the focused new timing checks; root separately reports successful final-contact navigation and review. Earlier `evidence/qa.json` results cover the former 57%/43% pacing, 1.05×/1.08× units, and extra scene hold/easing, and remain historical.

## Current completed implementation

- [x] Default prototype dev/preview scripts to `localhost:8268`; use `LOCAL_APP_ORIGIN=http://localhost:8273` for the current production-backed preview and keep `localhost:8272` as the development default. Allow only the named `eran.devshift.biz` public host; HTTP 200 is verified. Audit preview uses explicit `--host 127.0.0.1 --port 8274`.
- [x] Enable eligible first-beat layout in head preflight with an eight-second bootstrap watchdog. Set `journeyReady` independently of WebGL; prepare the preserved camera/geometry/shaders in cancellable chunks with a separate 20-second preparation deadline. Pause renderers under a fully black curtain and resume during reveal.
- [x] Emit pretranslated Hebrew HTML at `/he`, preserve query/hash on language switch, and localize contact while keeping identical beat/side/camera mapping.
- [x] The existing trust checkpoint contains the three original client testimonials without adding a journey beat. It initializes as the card approaches, previews one change after one second, then rotates every eight seconds while readable. Changes use a 320ms fade and 6px shift; reduced motion makes them instant without disabling autoplay. Explicit carousel Pause and hidden/out-of-range state stop rotation; hover, focus, manual navigation, and global neural Pause do not suppress it. Manual navigation resets the reading interval, inactive slides stay inert, and disposal clears observers/timers.
- [x] The mobile renderer profile requires a primary coarse pointer and either a physical screen short side of at most 900px or a viewport narrower than 700px. Head preflight selects the profile before paint; a fine-pointer desktop retains Three.js even in a narrow window. Mobile imports only `src/mobile-scene.js` and draws the 2.5D journey and distant field together in `#neural-field`; desktop retains `scene.js` plus `field.js`. The mobile renderer caches neuron/glow sprites, draws a bounded set of nearby checkpoints, and adapts resolution to sustained draw cost. Its single scheduler targets 30fps in travel and 18fps at idle; these cadences are verified with a simulated clock, not measured phone frame rates.
- [x] Mobile uses six border-tail segments instead of twenty, removes backdrop blur and expensive card shadows, and caches DOM writes while applying panel transforms/opacity directly. Its stable `100svh` stage supplies journey height so address-bar changes do not repeatedly relayout the route. Profile changes replace/dispose graphics while preserving normalized journey position and manual pause; resize may recalculate the pixel scroll offset. Generation/abort guards, visibility/offscreen/black-stage pause, BFCache handling, and static fallback remain in place. The accepted 19 beats, `.2/.8` pacing, `1.35` speed, content-visible ending, and desktop scene/field modules are unchanged.
- [x] The current build, independent mobile/card/integration reviews, and all 49 tests pass: 20 existing tests, 16 mobile-runtime VM tests, six carousel tests, and seven fake-canvas/clock renderer tests. The current `/` and `/he` preview assets return HTTP 200 with correct MIME types and no desktop scene/field preload in HTML. The mobile scene is 7.81kB raw / 3.67kB gzip (`mobile-scene-m-dL43CT.js`); main is 47.09kB / 17.51kB (`index-D0HVJRzX.js`), and CSS is 107.02kB / 19.98kB (`index-DzH0tUzt.css`). Desktop `scene-4T9MWBOL.js` and `field-CsT23Vn8.js` retain their prior hashes; mobile avoids their roughly 141kB combined gzip import. No browser was launched for this follow-up; the user will inspect the phone visuals. No fresh Lighthouse run or actual-phone FPS result is claimed.
- [x] Retain the original captcha readiness/retry/race guards, honest failures, cancellation, duplicate-submit control, draft/focus restoration, and synthetic-only delivery boundary.
- [x] Preserve the earlier prepared-renderer first-scroll observation with no long task over 50ms, valid pre-readability home medians EN 94/HE 99, and all 32 non-home routes at 96–99/CLS 0/no failed resources. Use Lighthouse 13.4.1 default simulated-mobile conditions; do not infer physical-device/live PageSpeed performance.
- [x] Complete and independently review 700–778px desktop reading areas with 16–18px body text, modest mobile sizing, and bounded short-screen overflow. Earlier EN/HE desktop 1280/1440px and mobile 390/320px checks found no horizontal overflow; final compact refinements are for user inspection, without another agent browser run.
- [x] Fade in final contact content with centered 1.18×→1× scaling; fade the footer while anchored. Preserve ending camera/background behavior, 19 beats, `.2/.8` pacing, and `1.35` speed.
- [x] Preserve the earlier audited-asset EN scores 94/99/94 (median 94), HE 95/95/99 (median 95), and all 32 non-home routes 96–99 pass. All 38 accepted runs have CLS 0 and no failed assets, wrong MIME types, unexpected redirects, runtime errors, or warnings; report links are verified. These runs predate the mobile-renderer/carousel follow-up; no fresh score is claimed.

## Earlier completed founder and card revision

- [x] Remove Dvir from main-site English/Hebrew and shared founder content, retaining Saar and Eran.
- [x] Remove his prototype beat and renumber the remaining 19 beats (`0–18`): People `12–14`, FAQ `15–17`, Contact `18`. Keep eight chapter anchors.
- [x] Pass DOM `data-side` values from main into the 19-station scene route and validate matching counts.
- [x] Complete card polish: opening mouse scroll cue, internal card progress/timelines driven by scrolling, travelling edge glow, and stronger contrast.
- [x] Verify all 19 layouts at 1280×720, 390×844, and 429×928, expanded mobile cases/FAQ, forward/reverse internal card progress, idle edge glow, Pause/Resume, reduced-motion fallback, sampled scene sides, and the preceding endpoint behavior. That endpoint result predates the new ending. Actual OS backgrounding remains unverified.
- [x] Preserve earlier 20-stop evidence and performance samples as historical; do not infer new device or PageSpeed results.

## Earlier completed ending revision

- [x] In `src/main.js`, keep the final camera/pulse leg from raw `17.2` through `18.7` and fade only the background over the same span. `paint(value)` keeps final heading/contact/footer at normal arrival opacity, fully visible and non-inert on black. Preserve 19 beats, speed, other-stop pacing, and background-only opening.
- [x] Verify final contact/footer remain visible and non-inert on black at 1280×720, 390×667, and 320×568, including compact layout, logo loading, mobile menu selection/dismissal/focus, and reduced-motion fallback. Palette/integration reviews and build pass; rejected content-fade checks remain superseded.
- [x] Copy actual logo/favicon unchanged, implement the full desktop/mobile navigation and factual linked footer, and mix the brand purple into scene/UI accents while keeping the main signal cyan/white.

## Earlier completed contact, menu, and interaction revision

- [x] Use standalone Use cases/Careers primary links and native-dialog contact triggers in the header, mobile menu, and final CTA. Keep homepage chapters in the journey rail.
- [x] Match the existing fields/API/v3 captcha action; bundle only the public site key and route the contact endpoint through local Vite to the existing Next app at `localhost:8272`. Document the static-host rewrite requirement and failed local captcha verification without claiming delivery.
- [x] Implement the eight-column mobile rail and button feedback with focus, pause, and reduced-motion behavior. Focused 390×667 dialog/synthetic-response, validation, timeout, cancellation, duplicate-submit, draft, and focus checks pass; independent reviews approved.
- [x] Rail checks pass at 320×568, 390×667, and 442×1104 without overflow/control overlap; hover/pause/reduced-motion feedback and dialog focus restoration pass. Build, read-only route probe, and public-key-only bundle checks pass.
- [x] Verify the actual Google badge is hidden with the dialog closed/open while visible Privacy/Terms disclosure remains in the form. Actual localhost captcha and email delivery remain unverified.

## Earlier completed local route and icon correction

- [x] Convert all nine first-party page links to root-relative paths and proxy existing pages/locale variants/assets/Next WebSockets/contact and careers APIs to the local Next app. Documented the earlier two-server setup and temporary locale-home redirects; current routing now serves pretranslated `/he` while preserving the locale URL.
- [x] Preserve `#services`/`#work`/`#about` aliases; verify actual local pages, loaded Careers artwork, return-home behavior, and `#services` → beat `3`.
- [x] Align all eight rail dots and the line exactly at 475×1104, use SVG arrows, and keep the close icon still on hover. Build and review pass; no dependency/main-app/deployment changes or production backend use.

## Earlier 19-beat card verification — 2026-09-09

The earlier card-revision browser inspection verified all 19 heading/content boxes fit between header and footer at 1280×720, 390×844, and 429×928. Expanded case cards `7–9` and FAQ beats `15–17` also fit on mobile (maximum content bottom 656px; footer begins at 755px). Dvir is absent from rendered copy, and sampled scene/card sides match at beats `12`, `13`, `14`, `15`, and `18`.

The AI-agent card progresses and reverses through approximately `0 → 0.5 → 1 → 0.5 → 0` as scrolling traverses its reading hold, with matching stage labels while beat `3` remains active. Halfway through workflow, Request and Review are reached while Done remains pending. The edge glow advances while idle; Pause freezes its animation time and the field frame count, and Resume restores motion. Reduced motion exposes all 19 static, non-inert beats with completed card progress and no running decorative animations. Before the current ending revision, the endpoint check recorded scene/card progress and background black opacity at `1`, with content opacity still `1`; this is historical evidence for the preceding background-only ending.

Before the brand revision, conservative contrast calculations using the 98%-opaque lightest card color over white gave body text 10.45:1, dim stage text 9.20:1, and secondary text 9.66:1. Vite build and independent module/integration reviews pass. Build output: HTML 23.07kB, CSS 72.85kB, main JS 11.95kB, field JS 4.49kB, lazy scene JS 547.61kB; the existing scene-chunk warning remains. These are local browser/layout and functional checks, not a physical-device performance run or PageSpeed benchmark. No production deployment was performed.

## Historical pacing revision

- [x] Updated `src/main.js` to desktop unit `innerHeight * 1.6`, mobile unit `innerHeight * 1.65`, first 20% reading hold, and final 80% transit with one easing curve; build completed.
- [x] Navigation lands at `(destinationBeat + 0.1) * unit`. Keyboard Next reached beat 1 and focused its heading; final contact navigation reached beat/station 19, progress 1, and focused the contact heading in the default viewport.
- [x] Removed the scene's former `±0.18` station hold and second easing; camera travel consumes main's eased progress directly. Independent pacing review approved the change with no findings, continuous endpoints, and preserved focus.
- [x] `evidence/pacing-qa.json` records desktop 1354×1223 unit ratio approximately 1.6, hold through phase 0.2, increasing transition samples at 0.3/0.5/0.7/0.9, and identical progress at matching reverse positions.
- [x] Mobile 390×844 measured unit ratio approximately 1.65 and matching sampled hold/transition mapping. The 180ms jump samples include camera interpolation; they are not settled-layout or performance checks.
- [x] Preserved earlier QA as historical and disclosed an additional mobile settle-poll timeout under repeated emulation. No new all-20-stop or phone-performance result is claimed; root restored the page to Start after contact verification.

The pacing items above describe earlier completed 20-beat focused checks. The task records below retain that historical implementation/QA baseline; they have not been rerun for the current 19-beat/card revision.

### Task 1: Twenty fixed reading panels and complete static fallback

**Files:** HTML/CSS worker updates `experiments/neural-home/index.html` and `experiments/neural-home/src/styles.css`. Root maintains the experiment's package/lock files. The poster is captured in Task 4.

**Produces:** The existing 20 `.story-beat[data-beat]` elements within eight chapters, viewport-fixed panel presentation, alternating side/depth entry and depth exit, stop controls, and complete static fallback content.

**Complexity:** Medium. **Risk:** Low; isolation prevents production regressions.

- [x] Private ES-module package, exact dependency pins, and Vite dev/build/preview scripts are implemented and verified from `package.json`.
- [x] The actual 20-beat structure is preserved: Start `0`; Knowledge `1–2`; Capabilities `3–6`; Impact `7–9`; Process `10–11`; People `12–15`; FAQ `16–18`; Contact `19`. Existing copy, images, quotation attribution, and links remain present.
- [x] Fixed reading panels with side/depth entry, stationary holds, and depth exits are implemented. All 20 beats fit at 1440×1000 and all 20 fit at 390×844, with matching scene station and no horizontal overflow.
- [x] Static document-flow fallback restores all 20 beats without inert state in recorded reduced-motion, no-JavaScript, short 844×390, context-loss, and blocked-import checks.
- [x] The production bundle was built and previewed locally; no-JavaScript checking retains the verified contact `mailto:`.

### Task 2: Immersive neuron environment and camera journey

**Files:** Scene worker implemented `experiments/neural-home/src/scene.js`; root added `experiments/neural-home/src/field.js` and their shared lifecycle integration.

**Consumes:** `{ canvas: HTMLCanvasElement, onReady: () => void, onError: (error) => void }`.

**Produces:** Async `createNeuralScene(...)` with the required `{ setProgress, setPointer, resize, setPaused, dispose }` API plus implemented `setActivity(number)`. Synchronous `createNeuralField({ canvas })` returns `{ setProgress, setActivity, setPaused, resize, dispose }`.

**Complexity:** High. **Risk:** Medium; visual quality and GPU work require direct browser evaluation.

- [x] Historical curved 20-station route, lateral/depth travel, connected network, and finite contact endpoint were implemented; recorded beat/scene station pairs matched.
- [x] Historical scene used `i / 19` stations, an extra station hold/easing, and main's former 57%/43% mapping. This timing is superseded by the current revision above.
- [x] Added a 2D field with 85 desktop or 55 mobile nodes and a 24 fps scheduler. Recorded visible idle sampling: 48 field frames and 40 3D frames in two seconds.
- [x] Raw scroll activity energizes both layers independently of camera progress. The first-hold sample keeps progress at zero after 120px of scrolling while energy rises to 0.886.
- [x] Both layers implement pause, resize, and disposal. Recorded combined WebGL context loss restores 20 readable beats and disposes the field with zero remaining field frames.
- [x] Both modules preserve the documented APIs; the final 1408×880 poster was captured from the actual combined layers without DOM content.

### Task 3: Scroll and progressive enhancement integration

**Files:** Root updates `experiments/neural-home/src/main.js`; coordinate HTML/CSS integration with its owning worker.

**Consumes:** Twenty `.story-beat[data-beat]` elements, eight chapter anchors, stop controls, and the unchanged renderer API. **Produces:** A finite native-scroll-driven pinned journey, synchronized panel/scene state, and complete static fallbacks.

**Complexity:** Medium. **Risk:** Medium; lifecycle races can hide the poster or leave unnecessary animation running.

- [x] Eligible mode lazily loads both modules and enables pinned presentation after successful rendering. Reduced-motion reload fetches zero animation assets and retains all 20 visible beats.
- [x] Historical finite 20-unit mapping used 1.05×/1.08× viewport-height units and a 57%/43% hold/transit split. The revised 1.6×/1.65× and 20%/80% mapping now has the separate focused verification above.
- [x] Implemented active-beat inert/focus management, chapter jumps, bounded previous/next controls, and counter updates. Recorded keyboard Next focuses the arriving report heading; all static fallback checks remove inert state.
- [x] Main sends raw scroll energy, normalized journey progress, resize, pause, and cleanup to both modules. Manual pause records zero rendered frames for both layers.
- [x] Pause → reduced-motion → restoration retains a working Resume control. Simulated visibility-change handling records zero frames for both layers.
- [x] Short-height and motion-preference fallback handlers are implemented; short 844×390, no-JavaScript, import failure, and combined context-loss behavior are recorded.
- [ ] Verify actual OS background/foreground lifecycle; only the visibility handler was simulated in this QA.
- [ ] Exercise the exact 500→501px boundary transition; the recorded short-height sample is 844×390.

### Task 4: Actual-scene poster, browser evidence, and measurements

**Files:** Root captures `experiments/neural-home/public/neural-poster.webp` and updates `README.md`; coordinate any HTML/CSS fixes with the owning worker. Store review screenshots under the experiment when useful.

**Consumes:** Production build and integrated page. **Produces:** A local review URL, representative screenshots, measured results, and clearly stated gaps.

**Complexity:** Medium. **Risk:** Medium; desktop emulation alone cannot establish actual mobile GPU performance.

- [x] Recaptured `public/neural-poster.webp` from both actual layers without DOM content; final file metadata confirms 1408×880.
- [x] Built and exercised the local production preview at `http://127.0.0.1:8271/`. README documents commands and the roughly 547kB minified / 138kB gzip lazy 3D chunk warning.
- [x] Recorded 20/20 desktop and 20/20 mobile-viewport fit checks, matching station indices, no horizontal overflow, expanded insurance-card fit, and keyboard focus behavior.
- [x] Recorded reduced-motion, no-JavaScript, short-screen, import failure, and WebGL context-loss static fallbacks; the final context-loss check cleans up both layers.
- [x] Recorded both-layer visible idle rates, zero-frame manual pause, and zero-frame simulated visibility handling. Actual OS backgrounding remains separate and untested.
- [x] Recorded final combined 390×844 sampling after clearing emulation: 240 intervals over four seconds, median 16.7ms, p95 17.6ms, none over 50ms; 239 scene renders and 96 field renders.
- [x] Preserved the earlier severe combined stall sample (three intervals, all over 50ms) alongside default-viewport recovery and the clean repeated phone-viewport sample. Its cause is not established; do not omit it or call the repeat a real-phone benchmark.
- [x] README and `evidence/qa.json` document the local Mac/in-app Chromium responsive-emulation environment, no CPU/network throttling, source-claim boundary, and English/dark prototype scope.
- [ ] Independently verify physical-device GPU/battery behavior and run Lighthouse/PageSpeed; none was performed in this evidence.
- [x] Historical independent review completed before this pacing change: `/root/prototype_review` approved orchestration, scroll activity/progress, shared pause/visibility, resize/disposal, generation guards, and layering. `/root/field_review` reviewed field internals and its alpha-clamp fix was applied. This approval does not cover the new pacing edits.

## Historical success criteria

Checked items retain the earlier 20-beat baseline. Pacing acceptance below is limited to its historical focused checks; current 19-beat/card acceptance is tracked separately above.

- [x] All 20 source-based beats are implemented and fit the two recorded desktop/mobile viewports.
- [x] Historical pinned choreography and the curved 20-station scene were implemented through contact.
- [x] The added 24 fps 2D field and 20 fps 3D ambient layer remain alive and react to scrolling during reading holds.
- [x] Combined-layer manual pause, simulated visibility pause, preference restoration, and failure cleanup are recorded.
- [x] The final poster captures both actual layers; static fallbacks preserve all 20 beats and remove inert state.
- [x] Local build, recorded QA, recovered and failed frame samples, source boundaries, and prototype limitations are documented.
- [x] Changes remain inside the isolated experiment and its assigned documents; production integration is outside this work.
- [x] Revised unit ratios and sampled hold/transit mapping are measured, desktop reverse progress matches, Keyboard Next and final contact focus work, and the new pacing build/review are complete.
- [x] Rapid mobile interpolation and settle-poll timeout limitations are documented; the earlier full-page and performance evidence remains historical.
- [ ] Physical-device and Lighthouse/PageSpeed acceptance, actual OS backgrounding, and exact-height-boundary checks remain unverified.

## Earlier completed shared static-page/footer alignment

- [x] Reuse static Next page styles and SiteContactDialog without adding a neural canvas; share `src/styles/site-footer.css` between Next Footer and prototype HTML.
- [x] Keep Next on `localhost:8272` behind Vite `127.0.0.1:8271`, with `allowedDevOrigins` permitting the preview host for development WebSocket/hydration traffic.
- [x] Fresh Next/prototype builds, all 20 tests including artifact SEO, mobile EN/HE footer geometry, six secondary-page families, and form/menu interaction checks pass. All 19 beats and accepted pacing remain unchanged; no real submissions or PageSpeed measurement.
