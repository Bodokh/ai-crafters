# Homepage rendering experiment results

Measured on 2026-09-10 in the isolated `codex/homepage-vgpu-comparison` worktree. Desktop GPU work fell by approximately **32.3%** in the tested scroll replay, with unchanged median travel submission p95. Both versions scored a median **98/100** in local mobile Lighthouse audits. Mobile scrolling retained similar measured cadence but used **2.6% more total browser task time** and fetches **30,436 bytes of WebP assets** when scrolling first activates the scene. The evidence supports a desktop rendering improvement and comparable initial-load lab performance; equal or better mobile scrolling performance is not yet established.

## Scope and baseline

Baseline commit `29f9d3d` captures the original checkout's then-uncommitted and untracked homepage/SEO work. At measurement time, rendering changes were isolated in a separate worktree and the concurrent SEO agent's original checkout was left untouched. No production deployment was part of those measurements. The accepted renderer and copy are now integrated into the main site's `/` and `/he` routes; the visual comparison viewer and combined-build script have been removed. The measurements below remain evidence for their original builds, not for the later main-site integration.

- Desktop stays on Three.js. Tissue meshes are partitioned for culling. Revised material lighting and a simpler spatial grain calculation replace the previous fragment-noise calculations.
- Mobile stays on the existing Canvas2D renderer. Four transparent 288×288 neuron sprites were baked offline with actual vGPU native Metal execution. The scene begins paused behind the opening cover; the browser requests those optional images after the first scene frame when scrolling activates the renderer, then replaces the existing sprite canvases. Failed asset loads retain the procedural fallback.
- vGPU is a build-time asset tool here. No vGPU runtime or remote rendering service runs in visitors' browsers.

At benchmark capture, the journey controller, card motion, field renderer, relevant styling, HTML, SEO builder, configuration, and package files matched the snapshot across all 13 entries in [timing-source-checks.json](evidence/timing-source-checks.json). Desktop reading hold/speed remain `0.2`/`1.35`; mobile remain `0.4`/`1.6875`. The scroll unit remains `layoutHeight × (viewport width < 700 ? 1.65 : 1.6) / scrollSpeed`. Route motion and renderer cadence retain their original logic.

## Measured rendering results

The raw [benchmarks.json](evidence/benchmarks.json) contains exploratory runs as well as the comparison samples below. Each replay lasts approximately 10 seconds and uses matching scroll segments, including reverse travel. Before/after order alternates between pairs. These are local browser measurements, not physical-phone acceptance.

### Desktop

Use the three `desktop-gpu-baseline-*` and three `desktop-gpu-candidate-*` runs. The recorded viewport is 1314×1223 CSS pixels at DPR approximately 1.1; the scene bitmap is 1430×1345. GPU timer queries were supported, and every query resolved without disjoint discards or pending queries at completion.

| Metric | Baseline | Candidate | Interpretation |
| --- | ---: | ---: | --- |
| Median of three per-run mean travel GPU times | 1.030 ms | 0.697 ms | 32.3% lower measured GPU work |
| Per-run mean travel GPU times | 0.981 / 1.030 / 1.030 ms | 0.661 / 0.697 / 0.703 ms | All three candidate means were lower |
| Median of three travel submission p95 values | 17.6 ms | 17.6 ms | Same measured submission cadence |
| Median of three travel CPU submission-envelope p95 values | 0.2 ms | 0.2 ms | Same rounded p95 |

One candidate GPU-timed run contained a 104 ms main-thread long task; the other two candidate runs and all three baseline runs had none. This isolated stall is retained in the result rather than hidden by the medians. An earlier exploratory candidate desktop run also recorded a 50 ms task; it is not included in the GPU-timed comparison table.

GPU elapsed time excludes browser compositing and presentation. Submission intervals are not displayed FPS, and reduced triangles alone do not establish a performance improvement.

### Mobile

Use the three `mobile-cpu4-baseline-*` and three `mobile-cpu4-candidate-*` runs. Mobile/coarse-pointer emulation used 4× CPU throttling; the actual recorded viewport is 355×767 CSS pixels at DPR approximately 1.1. The renderer retains its 1× bitmap cap; the corrected final pair confirms a 355×767 field bitmap.

| Metric | Baseline | Candidate | Interpretation |
| --- | ---: | ---: | --- |
| Median of three recorded submission-interval p50 values | 33.4 ms | 33.4 ms | Same rounded median; mixed legacy boundary handling described below |
| Median of three all-replay CPU submission-envelope p95 values | 1.2 ms | 1.3 ms | Candidate adds 0.1 ms at this percentile |
| Median total browser `TaskDuration` per replay | 3970.683 ms | 4073.051 ms | Candidate uses 2.6% more task time |
| Additional optional neuron WebP payload | 0 bytes | 30,436 bytes | Requested after the first scene frame when scrolling activates the renderer |

One candidate mobile run contained a 66 ms main-thread long task; the other two candidate runs and all three baseline runs had none. Its cause is not established by this replay.

The first two mobile pairs predate phase-specific field summaries and report inactive WebGL-canvas dimensions in `finalSnapshot`. Their top-level `field` metrics still measure the active Canvas2D renderer. The earlier interval summaries exclude gaps crossing replay-segment boundaries; the final pair's global summaries include those gaps. The recorded p50 values are 33.4 / 33.4 / 33.5 ms before and 33.4 / 33.3 / 33.4 ms after. Their medians are descriptive aggregates across those schema versions, not a uniform interval-distribution comparison. CPU-envelope and total task-time metrics do not share this interval-boundary difference.

The corrected third pair records travel submission p50 of 33.4 ms before and 33.3 ms after, and p95 of 35.2 ms before and 34.9 ms after, with 204 travel submissions in each version. This single matched pair supports similar travel cadence but is not a three-run travel result.

The small CPU increase, later image payload, and isolated stall prevent a claim that mobile scrolling performance is already equal or better. The initial-load comparison below does not measure image fetching and decoding during first scene activation. That transition and sustained scrolling still need physical iPhone and Android acceptance.

### Initial mobile loading: Lighthouse

Three alternating matched pairs ran with Lighthouse 13.4.1 and a fresh temporary Chrome profile per run. Settings were identical: 412×823 mobile emulation, DPR 1.75, simulated 4× CPU and Slow 4G. The copied [Lighthouse summary](evidence/lighthouse-summary.json) contains all six results, exact settings, and absolute paths to the raw HTML/JSON reports.

| Initial-load metric | Baseline | Candidate |
| --- | ---: | ---: |
| Performance scores; median | 98 / 98 / 98; **98** | 98 / 99 / 98; **98** |
| Median FCP / Speed Index | 1.184 s / 1.184 s | 1.168 s / 1.168 s |
| Median LCP | 2.263 s | 2.218 s |
| Median total blocking time | 47 ms | 25 ms |
| Median cumulative layout shift | 0 | 0 |
| Initial transferred bytes, every run | 225,202 | 225,526 |
| Initial requests, every run | 11 | 11 |

The candidate adds 324 bytes to initial transfer. None of the four neuron WebPs was requested during these initial-load audits; their 30,436-byte payload is deferred until scrolling activates the scene. Small timing differences across these samples do not establish a major loading improvement, while the unchanged median score supports comparable initial-load lab performance.

All six audits exited successfully with no runtime errors. The first baseline run reported a cache-clearing timeout despite its fresh profile; the other five had no warnings. Earlier failed IPv4 setup attempts are archived separately and excluded. These are local Lighthouse lab scores, not Google-hosted PageSpeed Insights results or real-user field data.

## Validation and open checks

- 51 homepage tests and 10 benchmark-harness tests passed; final rendering code review was approved.
- [Browser checks](evidence/browser-checks.json) recorded a ready mobile fallback, reduced-motion static content with zero rendering-asset requests, and a ready Hebrew/RTL page with four assets and no horizontal overflow. The comparison viewer was also checked with English/Hebrew navigation and retained scroll position.
- Six valid local Lighthouse mobile audits completed; both variants have a median performance score of 98. Public PageSpeed Insights and physical-device measurements remain unverified.
- Startup timing is not scored from `load-checks.json`: those samples included already-ready scenes or restored scroll positions and do not provide a valid cold-start comparison.
- Visual comparison was performed using the former viewer. Physical-phone smoothness, public-hosting performance, and production acceptance were not established by these checks.

### Follow-up: journey timeline alignment

After the measurements above, one CSS declaration changed the desktop chapter links from `justify-content: flex-end` to `flex-start`. This pins each dot to the vertical rail regardless of label length. Mobile keeps its existing centered override, and Hebrew keeps the same rail position. The saved timing-source hashes describe the earlier benchmark build; this later CSS alignment fix changes no animation, scroll, or renderer code. The comparison build was refreshed, and desktop/mobile English/Hebrew alignment was checked in the browser.


### Follow-up: contact entrance and phone preview

The initial contact entrance added a 420 ms desktop depth reveal, a brief gradient light sweep, and staggered content. That first revision completed mobile effects within 260 ms; keyboard opening was immediate and reduced motion used only a 100 ms opacity fade. Focus, native dismissal, scrolling, and submission handling retained their existing behavior. Six motion tests and independent code review passed. [Browser checks](evidence/contact-motion-browser.json) cover that revision's mobile fit, initial focus, keyboard/reduced-motion modes, rapid close/reopen, stale close events, and Hebrew. A local mobile test with 4x CPU slowdown observed a 17.4 ms p95 RAF interval during entry and zero remaining animations after settling; this is lab evidence, not physical-device acceptance.

The Lighthouse scores above describe the build before these contact-animation additions. This later change adds approximately 0.84 kB gzip of entry JavaScript and 0.14 kB gzip of CSS; it adds no image requests or animation library. Lighthouse was not rerun for this follow-up.

At that follow-up, the phone-test domain served the worktree from local port 8268, while the original-checkout preview was preserved on port 8277 and a local comparison ran on port 8276. Cloudflare configuration was not changed. [Route verification](evidence/phone-preview-route.json) records matching public HTML and entry assets for that worktree build. The mobile browser also loaded all four vGPU-generated neuron assets through the public domain. These are historical server details; the later main-site integration removes the comparison viewer.

### Follow-up: visible mobile contact entrance

The user selected the vGPU version and reported that the contact transition was not noticeable on their phone. The selected worktree was used for that phone-preview correction. Mobile entrance now rises 36 px from scale 0.95 and opacity 0.2 over 360 ms, with a matching light sweep. Content finishes within 320 ms. Only transform and opacity animate; desktop entrance and homepage scroll timing are unchanged.

Mobile pointer opening focuses the close button, including on reopen, so the form does not request the software keyboard during entry. A field tap remains immediately usable. Keyboard and assistive activation retain immediate opening and first-field focus; reduced motion retains the 100 ms opacity fade. Matching pointer presses distinguish zero-detail touch clicks from keyboard activation. Automatic focus events no longer cancel the entrance, while intentional pointer or keyboard interaction finishes it immediately. Native dismissal, scroll restoration, and submission handling are unchanged.

All seven motion tests and independent review passed. [New browser evidence](evidence/contact-mobile-followup.json) records visible intermediate frames at 390×844 and 4× CPU slowdown: 41 RAF samples, an 18 ms p95 interval, and zero remaining effects after settling. Early close and field clicks at a paused 80 ms entrance, rapid reopen, late focus, keyboard/reduced-motion modes, Hebrew fit, and desktop behavior also passed. The tool cannot dispatch trusted touch events, so the measured activation uses a trusted mouse pointer under mobile emulation; zero-detail touch classification is tested with synthetic events. Physical-phone keyboard behavior and performance remain unverified.

At verification time, the public HTML and `index-Gyh_GG4L.js` matched the local build byte-for-byte. This correction adds approximately 0.16 kB gzip to the preceding entry script and no CSS, images, or dependencies. The historical Lighthouse comparison above has not been rerun for either contact follow-up or the later main-site integration.

## Reproduce and inspect

Follow the [main-site build instructions](README.md#build-and-inspect-the-accepted-homepage) to inspect the accepted homepage. The main-site build now serves its indexable English/Hebrew output alongside the existing Next secondary pages and APIs. The comparison viewer and combined baseline build are removed. New before/after measurements require separately built revisions under matching conditions.

The original four JSON files in [evidence](evidence/) are byte-for-byte copies of the recorded comparison evidence and Lighthouse summary. The later [timeline alignment check](evidence/timeline-alignment.json) records the CSS follow-up separately. Keep them unchanged when adding later runs; report new evidence separately with its browser, device, throttle, build, and sample-selection details.
