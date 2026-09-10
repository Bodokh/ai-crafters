# AI Crafters: copy, conversion, SEO and AI search review

Reviewed September 10, 2026, with the subsequent main-site integration described below. The accepted homepage is the English/Hebrew neural journey, whose source remains in `experiments/neural-home`. It now supplies the main site's `/` and `/he` routes alongside the existing Next secondary pages and APIs. The earlier copy pass mistakenly targeted the older Next homepage before correcting the accepted neural content; the old homepage route and visual comparison viewer have since been removed. This document separates source integration and historical local validation from public deployment, recrawling, and search outcomes.

## Business goal and positioning

The goal is qualified project inquiries for **custom AI solutions built around a client's business**, including operational workflows and AI capabilities inside existing products. Search traffic and clicks are useful only when they bring relevant buyers closer to a conversation.

The source supports two buying needs:

- Business and operations teams: less repetitive document handling, data entry, information retrieval, and coordination between systems.
- Product and engineering teams: AI agents, knowledge assistants, business-data analysis, and AI features integrated into existing software, including work alongside internal engineers.

Working assumptions: retain English and Hebrew, remain workflow-led across industries, and use the existing inquiry form as the primary conversion. Priority geography, project budget floor, preferred industries, publication approval for existing proof, and whether booking or WhatsApp should become the primary action still need business input. No prices, free consultations, delivery dates, certification claims, or universal performance guarantees were added.

## What changed

| Surface | Previous weakness | Retained improvement |
|---|---|---|
| Accepted neural homepage | The initial copy pass targeted the older Next homepage | “Custom AI. Built for you.” with tailored agents, workflows, and product AI fitted to the client's systems and data |
| Older Next homepage | The initial pass rewrote the wrong homepage | Its route is removed; the accepted neural journey is the main homepage |
| Hebrew neural homepage | The accepted visual journey needed the same clear custom offer | “פתרונות AI. בדיוק בשבילכם.” and natural business Hebrew describing a solution fitted to the client's systems and needs |
| Primary action | Generic automation promises and a neural hero action that continued the journey | “Discuss your project” opens the existing neural contact dialog; the secondary case-study link and scroll cue remain. App inquiry prompts describe the next step |
| Supporting claims | Blanket 80% reduction, maximum ROI, fear of being left behind | Specific business benefits without numerical guarantees or urgency claims |
| Services | Similar technical categories with little help choosing | Six distinct buyer needs, fit criteria, intended improvements, and a clear build process |
| Service and comparison pages | No inquiry action in the page body | Contextual inquiry prompts; services also have a hero action |
| Project examples | All-projects-in-production wording conflicted with a rollout case | Individual delivery status, reported results in context, rollout objectives separated from achievements |
| Next app FAQs | Three general company answers | Six buying questions covering fit, packaged versus custom tools, integration/data, cost/timing, human control, and starting a conversation |
| Buyer guides | Three broad comparison paragraphs and five short checklist items | Six decision paragraphs and eight practical vendor-evaluation checks |
| Internal links | Buyer guides had no incoming links from other content pages | Links from service inquiry sections and between related buyer guides |
| Metadata | Service categories led the homepage search snippet | Custom AI development and business automation lead, with a relevant invitation to inquire |
| Breadcrumbs | Duplicate destinations represented nonexistent category pages | Actual home → page paths |
| Crawl directives | Named bots did not inherit the wildcard API restriction | Consistent `/api/` exclusion in both robots groups |
| Freshness | Every build set all sitemap modification dates and an AI-text update date | Removed dates not backed by editorial modification records |
| Contact response | Provider error objects could still yield a success screen | Success requires a provider acknowledgement with a nonblank message ID |

The neural correction preserves the accepted 19 beats, eight chapters, SVGs, renderers, transitions, and scroll timing. Thirteen animation/controller/CSS files match the SHA-256 hashes captured before the correction. Quoted testimonials and founder biographies were preserved. The earlier app pass preserves route slugs, languages, legal terms, and job requirements; it corrected an accidental “Sorry” suffix on one Hebrew testimonial role.

The neural homepage's localized titles, descriptions, language alternates, social metadata, and structured data match the visible English/Hebrew content, including answers drawn from the visible FAQ. Those changes are retained in the main-site build. An ordinary isolated Vite preview retains `noindex,nofollow`; the main site's `site` build emits indexable HTML. Source integration and local metadata do not establish changed live search visibility.

### Main-site integration

Root `npm run dev` and `npm run build` first build the accepted homepage through `build:home`. Vite's `site` mode writes its English/Hebrew HTML and assets into ignored `public/_home`; middleware serves that HTML at `/` and `/he` before Next's locale handling. `/en` redirects permanently to `/`. The previous Next homepage route is removed, while secondary pages, localized buyer content, and existing APIs remain in Next. The homepage includes links to all six service pages for discovery and defers the existing Google Ads tag. No comparison viewer or baseline route is shipped.

The root postinstall installs the homepage's locked dependencies, and postbuild includes public/static assets in the Next standalone output. See the [root setup guide](../README.md) for the single-server workflow. These changes retain the accepted neural copy and vGPU rendering; they do not represent a new copy review or a fresh Lighthouse measurement. Supplementary Next Markdown remains generated from its existing content rather than from the neural template and requires separate editorial reconciliation.

## Verified search baseline

This baseline describes the previously crawled live site, including the older homepage. It does not measure the local neural homepage or the effect of these copy changes.

Source: Google Search Console domain property `sc-domain:ai-crafters.com`, finalized Web results requested for August 10–September 7, 2026. The API returned data for **September 6–7 only**.

| Measure | Observed result |
|---|---:|
| Property impressions | 36 |
| Clicks | 1 |
| CTR | 2.78% |
| Average position, approximate | 4.85 |
| English homepage | 1 click / 34 impressions / 2.94% CTR |
| Visible query impressions | 22 |
| Visible branded-query impressions | 19 |

The only observed click was for “ai crafters.” The remaining three visible nonbrand impressions were a named-person/company lookup, not a demonstrated service-buying query. Query privacy and aggregation prevent classifying all 36 impressions from the 22 visible query impressions. Page impressions sum differently from property impressions; the site total above uses daily property rows.

The previous equal period returned no data. Extending the query back to June 10 returned the same two days. This does not establish growth, a poor CTR problem, or the effect of any copy change. There is no measured conversion or independent AI-citation baseline in this audit.

Google URL Inspection reports both language homepages and both language AI-agent-development pages indexed and crawlable, with matching selected and declared canonicals. These are Google's last-crawl observations, not acceptance of the new local code. No submitted sitemap was listed on this domain property; that does not mean the public sitemap is missing or that another property has no submission.

Machine-readable evidence: [search-console-baseline-2026-09-10.json](./search-console-baseline-2026-09-10.json).

## Search intent and page map

These are **candidate buying queries**, based on the offer, existing pages, and a small live search sample. They are not measured search-volume, competition, or ranking estimates. Each page should answer its own buying question instead of repeating the same generic AI paragraph.

| Priority | English query / Hebrew query | Best existing destination | Visitor's question |
|---|---|---|---|
| High | custom AI development / פיתוח AI בהתאמה אישית | Homepage | Can you build around our specific business? |
| High | AI solutions for business / פתרונות AI לעסקים | Homepage | What can AI do for our company? |
| High | AI agent development company / חברה לפיתוח סוכני AI | AI agent development | Can an agent handle this workflow? |
| High | AI workflow automation / אוטומציה מבוססת AI | Workflow automation | Can we reduce manual work between systems? |
| High | custom AI integration / שילוב AI במערכות קיימות | Custom AI integration | Can we add AI without replacing our product? |
| High | AI knowledge assistant / עוזר AI לידע ארגוני | Knowledge base AI | Can staff find answers in our documents? |
| High | RAG development services / פיתוח מערכות RAG | Knowledge base AI | How will answers use our approved knowledge? |
| High | enterprise AI agents / סוכני AI לארגונים | Enterprise AI agents | How do we manage permissions and approvals? |
| High | AI business intelligence / בינה עסקית מבוססת AI | AI business intelligence | Can business users ask questions of our data? |
| Medium | AI document processing / עיבוד מסמכים עם AI | Workflow automation + related cases | Which document tasks can we automate? |
| Medium | insurance claims AI automation / אוטומציה לתביעות ביטוח | Insurance claim example | Have you worked with policy-based document review? |
| Medium | AI inspection report generation / יצירת דוחות בדיקה עם AI | Inspection-to-report example | Can field notes become a structured report? |
| Medium | AI voice verification agent / סוכן קולי לאימות ספקים | Vendor verification example | What is possible, and what is the project's rollout status? |
| Medium | AI development agency vs in-house / ספק AI או צוות פנימי | Comparison guide | Which delivery model fits our situation? |
| Medium | AI agent RFP checklist / בחירת ספק לפיתוח AI | Vendor evaluation checklist | What should we ask and compare before buying? |
| Medium | AI for CIM preparation / AI להכנת מסמכי CIM | CIM project example | How can specialist AI work support our internal team? |

Search samples included [WhaleBiz's custom development page](https://whale.co.il/solutions/custom), [Lesscode](https://lesscode.io/), and [Specteron's custom AI page](https://specteron.com/custom-ai). These pages show overlapping vocabulary around custom development and existing-system integration. This is a positioning observation, not a claim about their traffic, authority, or rankings. AI Crafters should differentiate through specific project evidence, delivery responsibilities, and fit for the buyer's workflow.

## SEO, AEO and GEO status

**SEO foundations:** the existing Next app has localized URLs, metadata, language alternates, HTML content, and a sitemap. The app pass improves intent clarity, internal discovery, breadcrumbs, and freshness accuracy. The accepted neural homepage's metadata is now included through the main-site build, whose HTML is indexable; only the isolated Vite preview retains `noindex,nofollow`. Relevant organic discovery is the main observed opportunity; the sample is too small to identify a CTR ceiling.

**AEO — answering buying questions:** the visible FAQs and expanded guides give direct answers about fit, integration, scope, and controls. Next app structured data and English Markdown reuse their underlying content. The neural homepage uses its own visible English/Hebrew FAQ for its structured answers. The homepage's supplementary Markdown still needs reconciliation with the accepted neural content; the retained Next Markdown is not generated from the neural template.

**GEO — visibility in generated answers:** actual inclusion and citation performance remain unmeasured. Google says ordinary SEO fundamentals apply to its AI features: useful accessible text, internal links, appropriate crawl access, and structured data matching visible content. It does not require special AI files or schema. Existing `llms.txt`/Markdown are maintained as additional formats, not treated as a ranking guarantee. [Google guidance](https://developers.google.com/search/docs/appearance/ai-features)

Accuracy matters in crawl signals as well: modification dates should reflect significant page updates, and specific robots groups do not inherit wildcard-group rules. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [robots specification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)

## Next decisions and measurement

1. **Approve the strongest proof.** Existing copy contains ~70% handling-time reduction, five-minute report preparation, and two-to-24-hour CIM drafts. Confirm each result's scope, dates, measurement basis, and publication permission. Add approved named case studies, screenshots, or attributed testimonials where available. Keep the Legacy AI joint-delivery contribution accurate.
2. **Confirm the preferred buyer and first action.** Decide geography, minimum useful project size, and whether an inquiry, scheduled call, or WhatsApp is the main destination. The current copy deliberately uses the working inquiry flow.
3. **Confirm measurement configuration.** Source includes an `AW-` Google Ads tag, but no explicit confirmed-lead event or GA4 ID was found. External account configuration was not inspected. Define CTA clicks, form starts, provider-accepted submissions, booked conversations, qualified leads, and pipeline value; carry page/locale/CTA context without sending form contents to analytics. Do not count a click or failed submission as a lead.
4. **Measure after deployment and recrawling.** Record release date; compare finalized 28-day windows by landing page, language, device, and branded/nonbrand queries. Evaluate CTR alongside impression volume, position, and qualified inquiries. With this traffic volume, short A/B tests would be inconclusive.
5. **Check AI visibility separately.** Bing Webmaster Tools' AI Performance report can show citations across supported AI surfaces. Establish dated baseline queries and record cited URLs, sources, locale, and environment. Do not combine those counts with ordinary search CTR. [Bing AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
6. **Release checks.** Verify deployed content, sitemap submission status, actual contact inbox delivery, and account-side conversion recording. Provider acceptance is not proof of inbox delivery. Core Web Vitals, physical-device performance, and a new PageSpeed score were not measured in this copy pass.

## Historical copy-pass validation

The checks below describe the September 10 copy work before the later main-site integration. They are retained with their original scope and do not establish deployment or performance of the integrated build.

### Earlier Next app pass

These checks apply to the Next app and its older homepage, not to the separate neural build.

- Fresh production build and TypeScript checks passed, with no missing-translation warnings in the final build.
- 30 source and behavior tests passed, including 10 tests exercising the contact route and installed email SDK with intercepted network requests.
- Five tests against the fresh build passed: 34 localized HTML pages, unique complete metadata/canonicals/language alternates, every page reachable by rendered anchors, inquiry actions on buyer pages, distinct breadcrumb destinations, and visible FAQ/schema consistency.
- All 40 directly requested local URLs returned HTTP 200: 34 public pages plus robots, sitemap, both llms endpoints, and representative company/FAQ Markdown. Robots exclusions and removal of unsupported freshness dates were verified from responses.
- Independent code/copy and contact-security reviews found no remaining actionable issues in this turn's changes.
- Local environment checks confirmed the email key, explicit recipient/from settings, and both CAPTCHA keys are present, without exposing their values. Deployed settings and real delivery remain unverified.
- Browser attempts during that earlier pass timed out. This was not visual acceptance of the accepted neural homepage.

### Neural homepage correction

- The final neural build and all 44 tests passed: 39 existing controller, testimonial, and renderer tests plus five new localized metadata tests. The new tests verify visible FAQ/schema agreement, locale-specific metadata, repeat generation without duplicates, and safe JSON serialization.
- Thirteen animation/controller/CSS files match the pre-correction SHA-256 baseline; the 19 beats, eight chapters, and SVGs are unchanged.
- The in-app browser verified neuron rendering and journey navigation, English/Hebrew hero and inquiry-dialog layouts, and English workflow-card wrapping at desktop and 390×844 narrow viewport sizes. No horizontal overflow was observed in the checked layouts. Client-results navigation and the return to the neural homepage work. The narrow viewport used the desktop renderer; this is not physical-phone or mobile-renderer visual acceptance.
- Built English/Hebrew previews return HTTP 200 with localized canonical/social metadata, one schema block, 19 beats, and preview `noindex`. Main CSS/JS assets return HTTP 200 with correct MIME types; representative English/Hebrew service and use-case routes work through the preview proxy. Independent code review found no actionable issues.
- No real CAPTCHA submission, inbox delivery, physical-device performance, or new PageSpeed measurement is claimed. Historical neural Lighthouse results remain version-specific in the [neural README](../experiments/neural-home/README.md).

The integrated homepage can now be reviewed through root `npm run dev`, or `npm run build` followed by `npm start`, at [English /](http://localhost:3000/) and [Hebrew /he](http://localhost:3000/he). The same Next server supplies secondary pages and the contact API; a separate homepage proxy is unnecessary. Use the literal `localhost` bind hostname for this installed Next.js version when overriding the host: the earlier preview encountered locale redirects when bound to `127.0.0.1`. [Upstream issue](https://github.com/vercel/next.js/issues/94745)

No public deployment, search submission, analytics-account change, or real test email was included in the historical copy pass. The later source integration does not by itself verify any of those outcomes.
