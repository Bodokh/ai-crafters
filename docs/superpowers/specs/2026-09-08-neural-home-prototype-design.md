# AI Crafters Neural Homepage Prototype Design

Current scope: the bilingual 19-beat preview runs at `http://localhost:8268`, with pretranslated `/he` and the existing Next production app at `localhost:8273` selected through `LOCAL_APP_ORIGIN`. Vite's default app target remains `localhost:8272` for development. The exact public host `eran.devshift.biz` is allowed and returned HTTP 200. An isolated `127.0.0.1:8274` preview is used for audits. See the prototype README for both server commands.

Historical Lighthouse 13.4.1 acceptance used default simulated mobile (412×823, 4× CPU, 150ms RTT) on `index-C3t_9s6P.js` / `index-CRFAiRHu.css`, before the later closing-timing and mobile-renderer/carousel changes. The current follow-up has not been reaudited. All 34 routes pass at 94–99 across 38 retained runs, with CLS 0 throughout. EN homepage scores are 94/99/94 (median 94); HE scores are 95/95/99 (median 95); all 32 non-home routes score 96–99. Homepage LCP is 2.11–2.96s and TBT 12–30ms, versus baseline 6.42s/5214ms and score 40. No failed assets, wrong asset MIME types, unexpected redirects, runtime errors, or run warnings occurred. `experiments/neural-home/reports/lighthouse/README.md` and `final/summary.json` contain the accepted reports; the report links were checked. Pre-readability and broken-logo diagnostic runs remain excluded from final acceptance. These are local production-build lab results, not physical-device or live PageSpeed measurements.

Date: 2026-09-08
Last updated: 2026-09-09
Status: The separate mobile 2.5D profile and animated testimonial follow-up are implemented; desktop rendering, 19-beat pacing, localized contact, and routing remain intact. Build, independent reviews, and all 49 tests pass. The user will inspect phone visuals; no browser or Lighthouse run was performed for this follow-up. Earlier audited results below remain asset-specific; no real form delivery or physical-device result is claimed.

## Purpose and scope

Place the whole homepage inside an immersive branching neural network. The enhanced experience pins the viewport while native wheel/scroll input advances a finite 19-stop timeline. Panels arrive from alternating sides and depth, hold still for reading, then depart into depth as the camera follows a curved route to the next stop. The background network remains subtly alive throughout.

The user's final correction explicitly rejects normal-flow content in the enhanced experience and a straight camera route. This supersedes the prior eight-section measured-position architecture. Normal document flow is now a static fallback only. Preserve the navy/white neural direction with purple brand accents and cyan/white primary signals; literal mechanical/watch imagery remains rejected. Detailed task-specific use-case journeys remain a later phase.

Preserve the accepted 19 beats, 1.35× scroll-speed multiplier, and 20%/80% hold/transit split. Readability changes must not alter the camera path or add a testimonial beat.

This remains an isolated, reversible experiment in `experiments/neural-home/`. Existing tracked and untracked production work must be preserved. The prototype includes truthful source-based knowledge, agents, results, process, team, FAQ, and contact content, following the opening hero.

## Global constraints

- Keep neural presentation changes in `experiments/neural-home/` and these design/plan documents. The user also authorized main-site founder removal and shared static-page/footer/contact-shell design alignment, including the development-origin setting. Preserve unrelated production work; no commits or deployment.
- Use Vite `8.2.2` and Three.js `0.185.1`, pinned exactly in the experiment's own `package.json`.
- Serve English and pretranslated Hebrew in dark mode. RTL applies to reading content; keep physical `data-side`, camera coordinates, and the 19-beat mapping identical across languages. Light mode remains out of scope.
- In enhanced mode, pin the viewport and present 19 fixed reading stops across eight chapter groups; native wheel/scroll input controls the finite timeline.
- Use one scroll unit per stop: `(1.6 × viewport height) / 1.35` on desktop and `(1.65 × viewport height) / 1.35` on mobile, with 20% reading hold and 80% transit.
- Navigation lands at `openingLength + destinationBeat + 0.1` scroll units, halfway through the destination reading hold; the scene follows main's eased transition without an extra station hold or second easing curve.
- Use static normal document flow only for reduced motion, no JavaScript, scene error, or viewport height at or below 500 CSS pixels.
- Keep the desktop Three.js scene and separate 2D field; the coarse-pointer mobile profile uses one Canvas 2D 2.5D renderer. Both cover the complete enhanced journey, including FAQ and contact.
- Use `public/neural-poster.webp`, a 1408×880 capture of both actual visual layers without DOM copy, as the immediate static background.
- Reduced motion retains the static composition and all readable content without fetching a neural renderer module.
- Desktop visible ambient targets remain near 20fps for 3D and 24fps for the field; mobile uses one scheduler targeting 30fps travel/18fps idle. Fully black curtain, manual pause, hidden document, and offscreen stage stop the selected renderer(s). These are scheduler targets, not physical-device measurements.
- Load visual assets, animation modules, and poster locally. The authorized contact dialog loads Google reCAPTCHA only on open and sends the existing form contract to the existing local Next `/api/contact` backend through Vite to `LOCAL_APP_ORIGIN` (current production app `localhost:8273`, default development app `localhost:8272`); local pages/assets and careers API use the same app. No new backend/provisioning.
- No analytics, fake submissions, fabricated customer claims, or invented performance scores.
- Provide chapter anchors, previous/next stop controls, and the verified `mailto:automate@ai-crafters.com`; copy and claims must come from existing site content.

## Visual direction

The scene surrounds the camera with branching neuron geometry at multiple depths. Prominent neural cell bodies, fine fibers, and restrained cyan signals establish a curved camera route through 19 distinct reading compositions. Vary lateral position, depth, and direction through the route rather than advancing on a straight rail. Add a connected background network across the whole route so the environment remains present between prominent nodes.

In the desktop profile, `src/field.js` adds a separate Canvas 2D background network with 85 nodes, or 55 at small viewport sizes, connected by fine lines and travelling pulses. Its target is 24fps while visible. Mobile instead draws its distant network inside the single 2.5D canvas. Raw scroll activity energizes the selected environment even inside a reading hold, while the panel and camera remain still.

The environment fills the viewport rather than appearing as an object displayed in a side panel. Compose clear reading space into the scene. Avoid decorative slabs, rigid layers, DNA spirals, machinery, and a generic disconnected particle cloud.

Palette: ink background `#07121f`, elevated background `#0c1c2d`, primary text `#eff6fc`, secondary text `#a2b9ce`, brand accent `#8b5cf6`, and cyan `#38bdf8` for the main signal. Use the existing local Rubik font if available, with a system fallback. Avoid heavy bloom, mirrored metal, gears, pistons, glass requiring expensive refraction, and excessive particles.

The final `public/neural-poster.webp` was recaptured at 1408×880 from both actual visual layers on the opaque `#07121f` background, without DOM text/cards. The page delivers that local image immediately and reveals the live canvases after successful initialization. A standalone generated illustration is not used for this fallback.

## Scroll narrative

| Chapter group and actual anchor | `data-beat` indices | Content |
| --- | --- | --- |
| Start — `#start` | `0` | Opening hero. |
| Knowledge — `#knowledge` | `1–2` | Knowledge/data sources; shared business context. |
| Capabilities — `#agents` | `3–6` | AI agents; workflow automation; business intelligence; custom integrations. |
| Impact — `#results` | `7–9` | Insurance operations; inspection reports; retail analytics. |
| Process — `#process` | `10–11` | Discovery/design; build/measurement. |
| People — `#team` | `12–14` | Saar and Eran founder stops; three original client testimonials in one carousel checkpoint. |
| FAQ — `#faq` | `15–17` | Five existing questions split into two, two, and one. |
| Contact — `#contact` | `18` | Final invitation and verified contact address. |

The existing `index.html` contains these eight `data-chapter="0"` through `data-chapter="7"` sections and 19 `.story-beat` elements with contiguous `data-beat="0"` through `data-beat="18"`. Preserve their complete content. Chapter links target the first beat in the relevant group; previous/next controls advance one beat. Both land at `openingLength + destinationBeat + 0.1` scroll units, halfway through the reading hold. The counter displays `01 / 19` through `19 / 19`.

Each finite scroll unit is `(1.6 / 1.35) × viewport height` on desktop or `(1.65 / 1.35) × viewport height` on mobile. At the earlier stops, its first 20% holds a stationary reading panel and camera; its last 80% moves the panel into depth, brings the next panel from its alternating side/depth composition, and advances the camera. Keep the last stop at contact; do not wrap or create an additional content stop. The final camera/pulse leg keeps moving as the background fades to black. Contact content fades in while scaling centrally from 1.18× to 1×; the footer fades while anchored. Both remain visible at the endpoint. Reverse deterministically when scrolling backward.

The scene exposes 19 normalized stations `i / 18`, for `i = 0…18`, along a curved route. Main passes the ordered DOM `data-side` values as `cardSides`; scene setup checks that their count matches the route and positions focal nodes opposite each card. Main maps the final 80% of each scroll unit into one eased transition between adjacent stations. Earlier legs follow that eased progress directly; the last leg uses the extended `sceneProgressAt` mapping through the background fade while final content retains normal arrival opacity. Remove the former `±0.18` station hold and second transition-easing curve so they cannot extend the pause or compress camera movement into a smaller part of the scroll.

During reading holds, desktop 3D pulses target 20fps and its separate 2D field targets 24fps; the mobile scheduler targets 18fps idle or 30fps with scroll activity, while visible and not fully black. Raw scrolling increases signal activity independently of station progress, without moving the reading camera. Scroll transitions can render the 3D scene at a higher cadence. Native wheel, touch, scrollbar, and keyboard input drive bounded browser scroll position; the visual viewport stays pinned rather than letting enhanced content scroll past it.

## Layout and accessibility

Enhanced mode fixes each reading panel within the viewport over the neural scene. Use lateral and depth transforms for entrance and depth for exit, preserving a stable, readable pose during each hold. Adapt panel framing and card arrangement for mobile within the fixed reading area. The enhanced experience is not a normal-flow homepage with background motion.

Retain complete semantic HTML as the static baseline. Eligible head preflight immediately enables the pinned first beat; its eight-second watchdog restores fallback if main does not initialize. Main sets `journeyReady` before graphics import/preparation, so content scrolling and navigation do not wait for WebGL. Graphics use a separate 20-second preparation deadline. Inactive enhanced panels must not leave offscreen controls in the keyboard tab order; the current stop, chapter navigation, previous/next controls, and motion control remain accessible. Restore ordinary reading order and interactive content when falling back; do not discard copy from the DOM.

Reduced motion, no JavaScript, scene error/context loss, and viewport height `≤500` use static normal document flow with automatic content height. All 19 beats, images, five FAQ answers, links, and contact information remain readable. Crossing the height threshold or changing motion preference must not strand the visitor in hidden panels. The canvas is decorative and hidden from assistive technology; controls retain visible focus.

Adapt truthful copy from verified existing sources such as `src/content/site.ts`, `src/content/useCases.ts`, and `messages/en.json`. Additional cards may organize that information, but must not invent customers, results, percentages, team members, roles, or delivery promises. Verify the source for contact destinations.

## File responsibilities and renderer contract

| File | Responsibility |
| --- | --- |
| `experiments/neural-home/package.json` and `package-lock.json` | Independent scripts and locked dependencies. |
| `experiments/neural-home/vite.config.js` | Pretranslate `/he`, preserve locale URLs, proxy ordinary pages/assets/APIs to `LOCAL_APP_ORIGIN`, bundle only the public captcha key, and allow the exact public preview host. |
| `experiments/neural-home/src/contact-dialog.js` and `contact-dialog.css` | Localized native form, current-locale API payload, lazy captcha, readiness/race/retry guards, validation, honest errors, cancellation, draft/focus handling, and disclosure. |
| `experiments/neural-home/src/localization.js` and `localization.css` | Pretranslated Hebrew copy/routes/labels, query/hash-preserving language switch, and RTL reading content without camera mirroring. |
| `experiments/neural-home/src/testimonials.js` and `testimonials.css` | Original three testimonials in existing trust beat; lazy approach initialization, one-second preview then eight-second readable rotation, 320ms fade/6px shift, reduced-motion instant changes, controls and lifecycle guards. |
| `experiments/neural-home/src/readability.css` | Reviewed larger copy/labels: 700–778px desktop areas, 16–18px body text, modest mobile sizing, bounded short-screen overflow. Final compact refinements are for user inspection. |
| `experiments/neural-home/src/interaction-polish.css` | Button feedback and mobile eight-column journey rail with shared pause/reduced-motion behavior. |
| `experiments/neural-home/index.html` | Eight chapter groups containing 19 semantic `.story-beat` stops, anchors, stop controls, FAQ, contact, canvas, and captured poster. |
| `src/styles/site-footer.css` | One shared footer stylesheet used by Next Footer and the prototype HTML via CSS import. |
| `src/components/SiteContactDialog.tsx` | Contact-dialog integration for ordinary static Next pages; no neural canvas. |
| `experiments/neural-home/public/brand/` | Unmodified main-site logo and favicon copies; transparent logo padding is cropped by CSS. |
| `experiments/neural-home/public/neural-poster.webp` | 1408×880 optimized actual capture of both visual layers, without DOM content. |
| `experiments/neural-home/src/styles.css` | Fixed panels, side/depth choreography, card contrast/edge glow, opening scroll cue, shared ambient pause styles, and static fallback/focus styles. |
| `experiments/neural-home/src/card-motion.js` | Internal card progress mapped from scroll, with complete static presentation when enhancement is disabled; forward/reverse and reduced-motion behavior checked. |
| `experiments/neural-home/src/main.js` | Immediate `journeyReady`, finite 19-beat pacing, preselected renderer branch, position-preserving profile changes, stable mobile stage height, cached panel writes, pause/lifecycle/fallback orchestration. |
| `experiments/neural-home/src/mobile-scene.js` and `mobile-performance.css` | Coarse-pointer 2.5D profile, cached sprites, bounded nearby route drawing, adaptive resolution, one scheduler, lighter card surfaces and effects. |
| `experiments/neural-home/src/scene.js` | Preserved curved 19-station route, cancellable chunked geometry/shader preparation, bounded ambient rendering, resize, and GPU cleanup. |
| `experiments/neural-home/src/field.js` | Independent 2D network with 85/55 nodes, scroll-reactive energy, 24 fps visible animation, resize, pause, and disposal. |
| `experiments/neural-home/README.md` | Local commands, prototype boundaries, and measured validation results. |
| `experiments/neural-home/evidence/qa.json` | Recorded viewport, fallback, pause, and frame-sampling evidence, including the failed transient sample. |
| `experiments/neural-home/evidence/pacing-qa.json` | Focused revised-pacing samples, measured desktop/mobile unit ratios, reverse progress, and keyboard navigation. |

```js
// Scene creation resolves after setup; onReady follows a successful first render.
const cardSides = [...document.querySelectorAll('.story-beat')].map(beat => beat.dataset.side);
const scene = await createNeuralScene({ canvas, cardSides, signal, initiallyPaused, onReady, onError });
scene.setProgress(0);       // Finite normalized value, clamped to [0, 1].
scene.setPointer({ x: 0, y: 0 }); // Normalized pointer coordinates in [-1, 1].
scene.resize();             // Derive dimensions from the canvas container.
scene.setPaused(true);      // Stop frames; resume catches up to latest target state.
scene.dispose();           // Cancel frames, remove listeners, free GPU resources.
```

`createNeuralScene` is exported from `src/scene.js`. `onReady` takes no arguments. `onError(error)` receives the setup, render, or context-loss error. `signal` cancels preparation and `initiallyPaused` suppresses rendering beneath a black curtain. Geometry/shader preparation yields in chunks while preserving the route. The scene owns GPU resources and render scheduling; orchestration owns the finite beat timeline, panel state, document visibility, and fallback preferences. After camera interpolation settles, the scene reduces to approximately 20 fps for ambient activity. `setPaused(true)` cancels scheduling entirely; resume uses the latest progress without a large elapsed-time jump.

The required scene API above is preserved; its implemented `setActivity(number)` additionally accepts raw-scroll energy. `createNeuralField({ canvas })` is synchronous and returns `{ setProgress(number), setActivity(number), setPaused(boolean), resize(), dispose() }`. Main loads these two modules together only for the desktop profile, sends progress/activity to both, and applies the same pause state. Context loss or initialization failure disposes the field as well as the scene before restoring the static document.

## Mobile renderer profile

The mobile renderer profile requires a primary coarse pointer and either a physical screen short side of at most 900px or a viewport narrower than 700px. Head preflight selects the profile before paint; a fine-pointer desktop retains Three.js even in a narrow window. Mobile imports only `src/mobile-scene.js` and draws the 2.5D journey and distant field together in `#neural-field`; desktop retains `scene.js` plus `field.js`. The mobile renderer caches neuron/glow sprites, draws a bounded set of nearby checkpoints, and adapts resolution to sustained draw cost. Its single scheduler targets 30fps in travel and 18fps at idle; these cadences are verified with a simulated clock, not measured phone frame rates.

Mobile uses six border-tail segments instead of twenty, removes backdrop blur and expensive card shadows, and caches DOM writes while applying panel transforms/opacity directly. Its stable `100svh` stage supplies journey height so address-bar changes do not repeatedly relayout the route. Profile changes replace/dispose graphics while preserving normalized journey position and manual pause; resize may recalculate the pixel scroll offset. Generation/abort guards, visibility/offscreen/black-stage pause, BFCache handling, and static fallback remain in place. The accepted 19 beats, `.2/.8` pacing, `1.35` speed, content-visible ending, and desktop scene/field modules are unchanged.

`createMobileNeuralScene` returns `setProgress`, `setTravel`, `setActivity`, `setPaused`, `resize`, and `dispose`. It shares the normalized checkpoint/scroll contract while using a lightweight 2.5D route; it does not import Three.js or the desktop field. Profile selection is re-evaluated on pointer/resize changes.

## Failure behavior and performance

Keep the captured poster if either loading or setup fails. WebGL context loss restores the static presentation, disposes the 2D field too, and retains all 19 beats with no lingering inert state. Manual pause stops both layers; the pause preference survives reduced-motion mode and restoration with a working Resume control. Disposal remains safe after partial initialization.

Load the scene through a dynamic import after the readable journey is ready, only when motion is allowed and viewport height exceeds 500 CSS pixels. Main independently drives the content timeline while graphics prepare. Desktop uses shared geometry/materials or batching and bounded pixel ratio; mobile uses cached sprites and bounded Canvas 2D drawing. Neither requires postprocessing. These are implementation budgets to verify, not a guarantee of a PageSpeed result.

## Current localization, testimonial, contact, and readability contract

`renderLocalizedHome` emits translated Hebrew HTML for `/he`; locale switching preserves the current query/hash, not an exact position within a chapter. The localized dialog retains the existing fields, current-locale payload, and `contact_submit` v3 action. Check `grecaptcha.execute` inside `grecaptcha.ready`, retain failure retry and cancellation/race guards, and do not infer real delivery from intercepted synthetic responses.

Trust beat `14` keeps Yogev Moyal, Nadia Senft, and Nitzan Shaulof. The existing trust checkpoint contains the three original client testimonials without adding a journey beat. It initializes as the card approaches, previews one change after one second, then rotates every eight seconds while readable. Changes use a 320ms fade and 6px shift; reduced motion makes them instant without disabling autoplay. Explicit carousel Pause and hidden/out-of-range state stop rotation; hover, focus, manual navigation, and global neural Pause do not suppress it. Manual navigation resets the reading interval, inactive slides stay inert, and disposal clears observers/timers.

The earlier desktop prepared-renderer first-scroll inspection observed no long task over 50ms. This is an in-app browser observation, not an OS-backgrounding or physical-device result. Larger typography is implemented and independently reviewed. Earlier EN/HE desktop 1280/1440px and mobile 390/320px checks found no horizontal overflow; no additional manual visual pass was performed for the final compact refinements because the user chose to inspect them. The retained Lighthouse acceptance includes those typography refinements, but predates the current mobile-renderer/carousel changes. Earlier test/build/geometry evidence below remains historical.

## Earlier 19-beat card verification — 2026-09-09

The earlier card-revision browser inspection verified all 19 heading/content boxes fit between header and footer at 1280×720, 390×844, and 429×928. Expanded case cards `7–9` and FAQ beats `15–17` also fit on mobile (maximum content bottom 656px; footer begins at 755px). Dvir is absent from rendered copy, and sampled scene/card sides match at beats `12`, `13`, `14`, `15`, and `18`.

The AI-agent card progresses and reverses through approximately `0 → 0.5 → 1 → 0.5 → 0` as scrolling traverses its reading hold, with matching stage labels while beat `3` remains active. Halfway through workflow, Request and Review are reached while Done remains pending. The edge glow advances while idle; Pause freezes its animation time and the field frame count, and Resume restores motion. Reduced motion exposes all 19 static, non-inert beats with completed card progress and no running decorative animations. Before the current ending revision, the endpoint check recorded scene/card progress and background black opacity at `1`, with content opacity still `1`; this is historical evidence for the preceding background-only ending.

Before the brand revision, conservative contrast calculations using the 98%-opaque lightest card color over white gave body text 10.45:1, dim stage text 9.20:1, and secondary text 9.66:1. Vite build and independent module/integration reviews pass. Build output: HTML 23.07kB, CSS 72.85kB, main JS 11.95kB, field JS 4.49kB, lazy scene JS 547.61kB; the existing scene-chunk warning remains. These are local browser/layout and functional checks, not a physical-device performance run or PageSpeed benchmark. No production deployment was performed.

## Historical focused verification of the pacing revision

These focused checks describe the earlier 20-beat route, before the current founder/card revision. Implementation, build, and independent pacing review were complete for that version. `experiments/neural-home/evidence/pacing-qa.json` records desktop 1354×1223 with a measured unit ratio of approximately 1.6, unchanged progress through phases 0–0.2, monotonic transition progress at 0.3/0.5/0.7/0.9, and identical progress at matching reverse positions. Keyboard Next reaches beat 1 and focuses “It starts with what you know.”

Mobile 390×844 measured a unit ratio of approximately 1.65 and the same sampled hold/transition mapping. Rapid jumps were sampled after 180ms and include camera interpolation; station values can still be catching up. They establish focused mapping observations, not a new layout/performance result. An additional mobile settle-poll check timed out during repeated emulation.

Root separately verified final contact navigation in the default viewport at beat 19, station 19, progress 1, with focus on the contact heading, then restored Start. `/root/prototype_review` approved the revised pacing with no findings, continuous endpoints, and preserved focus. No new all-20-stop layout rerun, physical-phone test, or phone-performance claim is made.

## Historical verification — before the pacing revision

Evidence: `experiments/neural-home/evidence/qa.json` and `experiments/neural-home/README.md`. These results predate the revised pacing and cover the former 57%/43% split, 1.05×/1.08× units, and extra scene hold/easing. They remain historical; the new focused pacing checks above do not constitute a rerun of this full suite.

Tests ran in Codex in-app Chromium on the local Mac, using responsive viewport emulation with no CPU/network throttling. They do not reproduce a physical phone GPU.

- All 20 desktop stops at 1440×1000 and all 20 mobile-viewport stops at 390×844 fit without horizontal overflow; recorded active beat and scene station match at every stop. The expanded insurance case card also fits the phone viewport.
- Keyboard Next focuses the arriving report heading. Manual pause, reduced-motion activation, and restoration retain a working Resume control.
- Reduced motion loads zero animation assets and exposes all 20 beats. No JavaScript, short 844×390, blocked scene import, and WebGL context loss preserve all 20 beats without inert state. The combined context-loss repeat also disposes the field and records zero field frames.
- Visible idle sampling recorded 48 field frames and 40 scene frames in two seconds, consistent with 24 fps and 20 fps. A 120px scroll inside the first reading hold kept scene progress at zero while activity rose to 0.886.
- Manual pause recorded zero frames for both layers. Simulated visibility change also recorded zero frames for both; actual OS backgrounding was not tested.
- The final combined 390×844 sample after clearing emulation recorded 240 animation-frame intervals in four seconds: median 16.7ms, p95 17.6ms, none above 50ms; 239 scene renders and 96 field renders. An earlier combined sample stalled severely (three intervals, all above 50ms). Clearing emulation restored default-viewport performance and a fresh identical mobile viewport repeat produced the final result. Both samples remain in the evidence; the cause of the first stall is not established.
- The production bundle was built and exercised locally. README records Vite's approximately 547kB minified lazy 3D chunk (approximately 138kB gzip) warning. The poster's 1408×880 dimensions were checked from the final file.
- Independent review was completed separately from the QA JSON: the prototype reviewer approved final orchestration/lifecycle/layering with no new material findings, and the field reviewer's alpha-clamp correction was applied.

Historical gaps at that revision included physical phones/GPU/battery behavior, actual OS backgrounding, exact fallback-boundary behavior, Hebrew/RTL, light mode, production integration, and Lighthouse/PageSpeed. Current bilingual/lab-audit status is stated above; physical-device/live PageSpeed acceptance is still not claimed. No production score is inferred from frame timing. Existing business metrics are source-site claims, not a new independent audit.

## Acceptance criteria

The current revision has 19 beats and two founders; its card visual, layout, pause, endpoint, and reduced-motion checks are recorded above. Checked items below preserve earlier 20-beat implementation/QA records. Pacing items refer only to their historical focused checks.

- [x] All 20 source-based beats are implemented under the eight chapter groups and fit both recorded desktop/mobile viewports.
- [x] Historical pinned choreography, curved 20-station route, navigation, and finite contact endpoint were implemented before the pacing revision.
- [x] Keyboard Next focuses the arriving heading; pause preference survives reduced-motion restoration.
- [x] The final 1408×880 poster captures both actual visual layers without DOM copy.
- [x] Recorded reduced-motion, no-JavaScript, short-screen, scene-import failure, and context-loss checks preserve all 20 readable beats.
- [x] The 24 fps field and 20 fps scene continue visibly at idle and react to raw scrolling inside a camera hold.
- [x] Manual pause and simulated visibility handling stop both layers; reduced motion fetches neither animation module.
- [x] Local build, asset warning, frame measurements, transient failed sample, and benchmark limitations are documented.
- [x] The result is identified as an isolated English/dark prototype with production and language/theme gaps stated.
- [x] Revised 1.6×/1.65× units and sampled 20%/80% mapping are measured; desktop forward/reverse progress matches.
- [x] Midpoint-hold navigation and direct scene progress are implemented and approved in review; Keyboard Next and final contact navigation/focus are verified.
- [x] Revised build and independent pacing review completed; rapid mobile interpolation samples and the settle-poll timeout are disclosed without new layout/performance claims.
- [ ] Physical-device GPU/battery testing and Lighthouse/PageSpeed benchmarking.
- [ ] Actual OS background/foreground testing and the exact 500→501px fallback boundary transition.

- [x] Current source removes Dvir from English/Hebrew/shared founder data and the prototype; the 19-beat DOM and scene route use matching side/count data.
- [x] Current opening scroll cue, card edge glow/contrast, forward/reverse internal progress, Pause/Resume, and reduced-motion behavior are browser-checked.
- [x] The preceding 19-beat/card revision fits all three recorded viewports; sampled scene sides and static reduced-motion content are checked. Its endpoint measurement is historical to the new ending.
- [x] Implement the latest correction: extend final camera/pulse travel while only the background fades, retaining normal final-heading/contact/footer opacity and interaction on black.
- [x] Desktop/mobile checks verify the corrected visible/non-inert contact/footer on black, compact layout, loaded logo assets, mobile menu selection/dismissal/focus, and reduced-motion contact/logo fallback. Palette/integration reviews and build pass. The rejected content-fade QA remains superseded.

- [x] Implement standalone Use cases/Careers menu links and the native contact dialog against the existing backend contract; focused synthetic UI cases and independent review pass. No real delivery is claimed.
- [x] Compact rail checks at 320×568, 390×667, and 442×1104, hover/pause/reduced-motion feedback, modal focus restoration, read-only contact route probe, and public-key-only bundle checks pass.
- [x] Verify the actual Google badge is hidden with the dialog closed/open while visible Privacy/Terms disclosure remains in the form. Real localhost captcha and email delivery remain unverified.

- [x] Keep all nine first-party page links local through the two-server Vite/Next setup; verify actual pages, loaded Careers assets, return-home behavior, legacy hash aliases, exact rail centering, and SVG controls. Build/review pass with no production backend or main-app changes.

- [x] Align ordinary Next pages with shared static styles/contact dialog and share `src/styles/site-footer.css` with the prototype; allow the Vite origin for Next dev traffic.
- [x] Fresh Next/prototype builds, all 20 tests including artifact SEO, mobile EN/HE footer geometry, six secondary-page families, and form/menu interaction checks pass; no real submissions or PageSpeed measurement.

## Current acceptance follow-up

The current build, independent mobile/card/integration reviews, and all 49 tests pass: 20 existing tests, 16 mobile-runtime VM tests, six carousel tests, and seven fake-canvas/clock renderer tests. The current `/` and `/he` preview assets return HTTP 200 with correct MIME types and no desktop scene/field preload in HTML. The mobile scene is 7.81kB raw / 3.67kB gzip (`mobile-scene-m-dL43CT.js`); main is 47.09kB / 17.51kB (`index-D0HVJRzX.js`), and CSS is 107.02kB / 19.98kB (`index-DzH0tUzt.css`). Desktop `scene-4T9MWBOL.js` and `field-CsT23Vn8.js` retain their prior hashes; mobile avoids their roughly 141kB combined gzip import. No browser was launched for this follow-up; the user will inspect the phone visuals. No fresh Lighthouse run or actual-phone FPS result is claimed.

The preceding bilingual/readability build passed the 34-route Lighthouse acceptance reported above. That remains historical evidence for its listed hashes, not a new audit of the mobile profile.
