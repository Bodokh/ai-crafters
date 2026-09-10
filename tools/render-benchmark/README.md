# Neural homepage rendering benchmarks

The [experiment results](RESULTS.md) include the measured desktop GPU improvement, mobile cost tradeoff, validation status, and raw evidence.

## Build and inspect the accepted homepage

Use Node.js 22.12 or newer and Yarn Classic for the root lockfile. From the repository root:

```sh
rtk proxy yarn install --frozen-lockfile
rtk npm run build
rtk npm start
```

The accepted homepage is served at [English /](http://localhost:3000/) and [Hebrew /he](http://localhost:3000/he) by the main Next site. The build includes the vGPU-generated mobile artwork and the accepted SEO/copy. See the [homepage guide](../../experiments/neural-home/README.md) for its build and development workflow.

The visual comparison viewer, combined-build script, and baseline routes have been removed. Retained measurements compare the historical snapshot `29f9d3d` with the rendering candidate as it existed on September 10, 2026; they are not measurements of later contact or main-site integration changes. A new before/after benchmark requires separately built revisions, with their exact commits and asset hashes recorded.

## Replay measurements

`replay.js` is a dependency-free async function expression for the supported browser session. Read the file, wrap it in parentheses, append the options invocation, and pass that expression to CDP `Runtime.evaluate` with `awaitPromise: true` and `returnByValue: true`:

```js
// source = the full contents of replay.js, read by the host
const expression = `(${source})(${JSON.stringify({ label: 'baseline-desktop', durationMs: 10000 })})`;
// Evaluate expression using the session's supported CDP API.
```

Use the homepage route for each separately built revision with the same serving setup, viewport, browser, device scale, and CPU throttle. Mobile must have touch/coarse-pointer emulation enabled **before navigation**; verify the returned `profile` is `mobile`. Keep the tested tab foreground and avoid concurrent browser work.

The desktop primary renderer uses `#neural-canvas`, reported under `scene`. The mobile primary renderer uses `#neural-field`, reported under `field`; its `scene` submissions are correctly empty. `primaryCanvasId` identifies the required renderer for sample validation, and snapshot dimensions refer to that primary canvas. Compare `field.replayTravel` for mobile performance.

Run baseline and candidate in alternating order, ideally three matched pairs. Save each JSON result alongside browser/device/throttle details. Navigate afresh for each sample. The benchmark changes scroll position during its run, then restores the original scroll. It installs temporary canvas submission wrappers and a long-task observer, and restores them in `finally`, including on failure.

The 10-second default replay holds at beats 0, 5, 10, and 15, travels between them, then travels back to beat 5. The same normalized beat positions and durations are used for both versions. It drives ordinary instantaneous scroll updates once per native RAF, leaving application easing, camera motion, ambient cadence, reading holds, and scroll-speed settings alone. It reproduces the current layout formula: opening/ending 0.5, desktop hold 0.2/speed 1.35, mobile hold 0.4/speed 1.6875. Output includes the actual beat count and scroll unit. Duration is bounded to 8–12 seconds, plus readiness and a consistent 900 ms settling period.

Compare these metrics:

- `scene.replayTravel.submissionEnvelopeMs`: CPU wall time from canvas clear through the last drawing API return. Includes intervening JavaScript and small wrapper overhead; excludes scene preparation before clear. Canvas2D fill/stroke/image submissions and WebGL draw submissions are counted without wrapping per-vertex/path construction methods.
- `scene.replayTravel.gpuTimeMs`: optional elapsed GPU timer queries, enabled by passing `gpuTiming: true`. Available only for the scene's WebGL2 context when `EXT_disjoint_timer_query_webgl2` is supported. A query brackets clear through the end of the synchronous frame, paired to that frame and its replay phase. Compare baseline/candidate with the same setting.
- `scene.replayTravel.submissionIntervalMs`: intervals between **actual** scene submissions within each travel segment. Checkpoint intervals are separate because intentional ambient caps must not be mistaken for dropped frames. Easing may continue during a checkpoint; desktop `appTravelTaggedSubmissions`/`appAmbientTaggedSubmissions` provide additional application tags.
- `rafIntervalMs.replayTravel`: foreground main-thread RAF cadence, independent of intentional renderer caps. Phase-specific intervals exclude transitions between segments; global `.all` interval statistics retain every interval, including boundary-spanning stalls.
- `longTasks`: count, duration, and blocking time of observed main-thread tasks over 50 ms during the measured interval.
- `scene.all.reportedDrawCalls`, `reportedTriangles`, `appRenderCountDelta`: the application's existing desktop canvas dataset counters. Mobile counters may be absent; instrumented submission counts remain available.
- `field`: separately measured field-canvas submissions when that renderer is present, including `field.replayTravel` and `field.replayCheckpoints` summaries.
- `checkpoints`, `finalSnapshot`, `errors`: bounded diagnostic output to detect mismatched replay, renderer fallback, canvas-resolution changes, and new runtime errors. Error capture covers only errors emitted during the benchmark; inspect page startup errors separately.

All percentiles use nearest rank. An empty sample has `samples: 0` and null statistics. Counts represent API submissions, **not GPU completions or displayed FPS**. RAF cadence is also not proof that every browser frame was presented. Scene readiness is only an observed time if the benchmark began before the scene became ready; an already-ready page returns no first-scene-frame timing. Measure cold loading separately if needed.

GPU timing is off by default. When enabled, `gpuTiming` reports support, created/resolved/discarded queries, queue saturation, and unresolved queries at the end. At most eight queries per context may be pending; an existing external timer query is never nested or ended. The harness polls availability on subsequent RAFs and reads results only when available, discards outstanding results on a disjoint event, and drains for at most two RAFs after measurement. It does not call `finish`, `flush`, or wait synchronously for the GPU. Every owned query is deleted in cleanup. GPU elapsed time excludes browser compositing and presentation; it is not presented FPS. The lifecycle follows the [Khronos WebGL extension specification](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/).

Run GPU timing as the only timer-query consumer for that WebGL context. Active external queries are detected and skipped, and their disjoint flag is preserved; external queries that have ended but still await results cannot be discovered by the WebGL API. Simultaneous timer consumers would therefore make disjoint handling unreliable.

Acceptance should consider visual screenshots, travel CPU p50/p95, travel submission/RAF p95, long tasks, draw submissions, and resolution together. A smaller triangle count alone does not establish faster rendering. Browser emulation and CPU throttling help find regressions but cannot replace physical iPhone/Android acceptance.

Run `rtk proxy node --test tools/render-benchmark/replay.test.mjs` for a dependency-free harness check. It simulates known Canvas2D/GPU costs, aggregation, checkpoint labeling, warmup exclusion, restoration after failure, GPU result availability, disjoint events, queue limits, and external-query isolation. This is harness validation, not browser performance evidence.


## Phone testing

The existing [phone-test URL](https://eran.devshift.biz/) uses the configured local port 8268. Serve the integrated Next site on that port to test the same `/` and `/he` routes as the main build. No Cloudflare route change is required. There is no comparison page. Local ports and tunnel availability depend on the running session and are not evidence of a production deployment.
