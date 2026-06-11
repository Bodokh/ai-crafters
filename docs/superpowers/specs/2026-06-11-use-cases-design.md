# Use Cases Pages Design

## Goal

Add a localized use cases section that turns the attached AI Crafters PDFs into website pages: one overview page with high-level summaries and one detail page per use case.

## Scope

The section includes:

- `/use-cases`: overview page with all use cases.
- `/use-cases/[slug]`: detail page for each use case.
- English and Hebrew support following the existing `next-intl` routing model.
- A navbar link to the new section.

The work excludes PDF design replication. The pages should use the current AI Crafters visual language and rewrite the content into the company voice while preserving the same business facts and structure.

## Content Source

The attached PDFs provide six content units:

- Capability overview.
- AI Agent for Insurance Claim Settlements.
- AI Q&A Layer over Business Intelligence.
- AI Voice Agent for Vendor Bank Account Verification.
- AI Inspection-to-Report for Field Sales.
- AI CIM Generator for M&A Advisory.

The overview PDF informs the `/use-cases` intro and cards. The five individual PDFs inform detail pages.

## Architecture

Create a typed content module that stores localized use case data and helper functions. Pages render from that module rather than duplicating content in each route.

Use reusable components for:

- Use case overview grid.
- Detail hero.
- Problem / build / impact sections.
- Proof strip.
- Related use cases.

This keeps future content edits straightforward and avoids six separate handwritten page structures.

## Page Experience

The overview page opens with a compact hero: "AI systems shipped to production", short supporting copy, and proof points from the capability overview. Below it, use case cards show:

- Status.
- Value theme.
- Client or industry.
- Headline outcome.
- Short summary.
- Link to the detail page.

Detail pages use this structure:

- Hero with title, status, industry, value theme, and headline outcome.
- Three sections: The Problem, What We Built, Business Impact.
- "Why it stands up" proof strip.
- Related use cases.
- Contact CTA.

## Content Voice

Keep the facts close to the PDFs, but rewrite in AI Crafters' direct business language:

- Production-grade systems.
- Grounded in client data and procedures.
- Measurable ROI.
- Lower manual workload.
- Faster decisions and revenue expansion.

Avoid PDF layout language and overly formal brochure phrasing.

## Navigation

Add `Use Cases` to the main navigation. It should route to `/use-cases` for both locales and appear in desktop and mobile nav.

## Error Handling

Unknown detail slugs return `notFound()`.

## Testing And Verification

Run:

- TypeScript / build validation through the project build command.
- Manual browser verification for `/en/use-cases`, `/en/use-cases/<slug>`, `/use-cases`, and one Hebrew detail page.
- Check desktop and mobile layout for text overflow and navigation usability.

