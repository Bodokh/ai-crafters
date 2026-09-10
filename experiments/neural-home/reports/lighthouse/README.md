# Mobile Lighthouse performance verification

**Version boundary:** These retained results describe the audited assets below. The later separate mobile 2.5D renderer, lighter cards, and animated testimonial follow-up passed build/review and 49 tests, but were not rerun in Lighthouse or visually checked in a browser by the agent. They carry no new measured score or actual-phone FPS claim.

Tested on 9 September 2026 with Lighthouse 13.4.1 and Chrome 152. Production builds served locally at `http://127.0.0.1:8274`; Next pages proxy to the production server on `localhost:8273`. No development/HMR scripts were present.

**All 34 public routes pass the requested 90+ mobile performance target.** The 38 retained final runs score **94–99**, with **CLS 0 throughout**. All 32 non-home routes score 96–99.

English homepage: **94, 99, 94** (median **94**). Hebrew homepage: **95, 95, 99** (median **95**). All six home runs used the final readability, centered finale, autoplay and RTL build: `index-C3t_9s6P.js` and `index-CRFAiRHu.css`.

The original homepage baseline scored 40, with LCP 6.42 seconds and TBT 5,214 ms. The final six homepage runs have LCP 2.11–2.96 seconds and TBT 12–30 ms.

After these measurements, the closing background fade and final camera arrival were moved earlier in the scroll timeline (`index-D0ftbe0k.js`). That timing-only follow-up passed build and source review; Lighthouse was not rerun for it. The retained reports describe the audited assets listed above.

## Method

- Default Lighthouse mobile emulation: 412 × 823, DPR 1.75, simulated 150 ms RTT / 1,638.4 kbps / 4× CPU slowdown.
- Fresh sequential Chrome runs; no parallel audit browsers, user-agent overrides, skipped performance audits, or changed score thresholds.
- Performance category. Each non-home route was audited once; both homepages were audited three times on identical final assets to show variability.
- Every accepted report was checked for failed network requests, HTTP 4xx/5xx, status-0 HTTP resources, asset responses incorrectly served as HTML, and unexpected redirects. None occurred. No Lighthouse runtime errors or run warnings occurred.
- These are local production-build lab measurements, not deployed PageSpeed Insights or real-device results. Transform-based movement can occur without affecting CLS; this report does not substitute for visual inspection.

## Per-route results

LCP and TBT show the range across retained runs. Every final run is retained; no low run was discarded.

| Route | Scores | Median | LCP (s) | TBT (ms) | CLS | Reports |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `/` | 94, 99, 94 | 94 | 2.11–2.96 | 12–30 | 0 | [1](final/home.report.html) · [2](repeats/home-run-2.report.html) · [3](repeats/home-run-3.report.html) |
| `/careers` | 96 | 96 | 2.74 | 39 | 0 | [1](final/careers.report.html) |
| `/compare/ai-agency-vs-internal-ai-team` | 99 | 99 | 2.12 | 32 | 0 | [1](final/compare--ai-agency-vs-internal-ai-team.report.html) |
| `/he` | 95, 95, 99 | 95 | 2.11–2.80 | 12–26 | 0 | [1](final/he-home.report.html) · [2](repeats/he-home-run-2.report.html) · [3](repeats/he-home-run-3.report.html) |
| `/he/careers` | 96 | 96 | 2.73 | 34 | 0 | [1](final/he--careers.report.html) |
| `/he/compare/ai-agency-vs-internal-ai-team` | 96 | 96 | 2.73 | 15 | 0 | [1](final/he--compare--ai-agency-vs-internal-ai-team.report.html) |
| `/he/resources/ai-agent-rfp-checklist` | 96 | 96 | 2.72 | 14 | 0 | [1](final/he--resources--ai-agent-rfp-checklist.report.html) |
| `/he/services/ai-agent-development` | 96 | 96 | 2.72 | 14 | 0 | [1](final/he--services--ai-agent-development.report.html) |
| `/he/services/ai-business-intelligence` | 97 | 97 | 2.66 | 32 | 0 | [1](final/he--services--ai-business-intelligence.report.html) |
| `/he/services/custom-ai-integration` | 96 | 96 | 2.73 | 40 | 0 | [1](final/he--services--custom-ai-integration.report.html) |
| `/he/services/enterprise-ai-agents` | 96 | 96 | 2.73 | 14 | 0 | [1](final/he--services--enterprise-ai-agents.report.html) |
| `/he/services/knowledge-base-ai` | 96 | 96 | 2.73 | 32 | 0 | [1](final/he--services--knowledge-base-ai.report.html) |
| `/he/services/workflow-automation` | 96 | 96 | 2.73 | 32 | 0 | [1](final/he--services--workflow-automation.report.html) |
| `/he/terms` | 99 | 99 | 1.94 | 47 | 0 | [1](final/he--terms.report.html) |
| `/he/use-cases` | 96 | 96 | 2.73 | 11 | 0 | [1](final/he--use-cases.report.html) |
| `/he/use-cases/business-intelligence-qa` | 96 | 96 | 2.72 | 14 | 0 | [1](final/he--use-cases--business-intelligence-qa.report.html) |
| `/he/use-cases/cim-generator` | 96 | 96 | 2.72 | 13 | 0 | [1](final/he--use-cases--cim-generator.report.html) |
| `/he/use-cases/inspection-to-report` | 96 | 96 | 2.80 | 17 | 0 | [1](final/he--use-cases--inspection-to-report.report.html) |
| `/he/use-cases/insurance-claim-settlements` | 96 | 96 | 2.72 | 15 | 0 | [1](final/he--use-cases--insurance-claim-settlements.report.html) |
| `/he/use-cases/vendor-bank-verification` | 96 | 96 | 2.72 | 14 | 0 | [1](final/he--use-cases--vendor-bank-verification.report.html) |
| `/resources/ai-agent-rfp-checklist` | 96 | 96 | 2.72 | 14 | 0 | [1](final/resources--ai-agent-rfp-checklist.report.html) |
| `/services/ai-agent-development` | 96 | 96 | 2.75 | 37 | 0 | [1](final/services--ai-agent-development.report.html) |
| `/services/ai-business-intelligence` | 99 | 99 | 2.01 | 14 | 0 | [1](final/services--ai-business-intelligence.report.html) |
| `/services/custom-ai-integration` | 98 | 98 | 2.45 | 14 | 0 | [1](final/services--custom-ai-integration.report.html) |
| `/services/enterprise-ai-agents` | 97 | 97 | 2.53 | 33 | 0 | [1](final/services--enterprise-ai-agents.report.html) |
| `/services/knowledge-base-ai` | 96 | 96 | 2.73 | 30 | 0 | [1](final/services--knowledge-base-ai.report.html) |
| `/services/workflow-automation` | 96 | 96 | 2.74 | 30 | 0 | [1](final/services--workflow-automation.report.html) |
| `/terms` | 96 | 96 | 2.73 | 14 | 0 | [1](final/terms.report.html) |
| `/use-cases` | 96 | 96 | 2.72 | 14 | 0 | [1](final/use-cases.report.html) |
| `/use-cases/business-intelligence-qa` | 96 | 96 | 2.74 | 14 | 0 | [1](final/use-cases--business-intelligence-qa.report.html) |
| `/use-cases/cim-generator` | 96 | 96 | 2.71 | 13 | 0 | [1](final/use-cases--cim-generator.report.html) |
| `/use-cases/inspection-to-report` | 99 | 99 | 2.06 | 16 | 0 | [1](final/use-cases--inspection-to-report.report.html) |
| `/use-cases/insurance-claim-settlements` | 97 | 97 | 2.65 | 14 | 0 | [1](final/use-cases--insurance-claim-settlements.report.html) |
| `/use-cases/vendor-bank-verification` | 96 | 96 | 2.73 | 14 | 0 | [1](final/use-cases--vendor-bank-verification.report.html) |

## Artifacts

- [Machine-readable acceptance summary](final/summary.json)
- [Original homepage baseline](baseline/home.report.html)
- [Baseline route summary](baseline/summary.json)
- `final/`: raw JSON and HTML for all 34 routes.
- `repeats/`: four additional raw homepage runs.
- [Pre-readability comparison runs](interim/pre-readability/README.md) are retained separately and excluded from final acceptance.
- `interim/home-first-optimization`: diagnostic only. Its logo URL returned HTTP 400 and was subsequently fixed; this interim score is **not acceptance evidence**.

## Reproduction

```sh
npm exec --yes --package=lighthouse@13.4.1 -- lighthouse http://127.0.0.1:8274/ --only-categories=performance --chrome-flags="--headless=new" --output=json --output=html --output-path=home --quiet
```
