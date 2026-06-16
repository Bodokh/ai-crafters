import {
  comparisonPages,
  company,
  faqs,
  founders,
  getComparisonPage,
  getResourcePage,
  getServicePage,
  resourcePages,
  servicePages,
} from '@/content/site';
import { getUseCase, getUseCases } from '@/content/useCases';
import { absoluteUrl, localizedUrl } from './seo';

const locale = 'en' as const;

const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

const section = (title: string, body: string) => `## ${title}\n\n${body.trim()}`;

const sourceLink = (label: string, path: string, note?: string) =>
  `- [${label}](${absoluteUrl(path)})${note ? `: ${note}` : ''}`;

export const renderLlmsTxt = () => {
  const useCases = getUseCases(locale);

  return `# ${company.name}

> ${company.shortDescription[locale]}

${company.valueProposition[locale]}

Important context:
- Canonical website: ${absoluteUrl('/')}
- Primary language: English
- Secondary language: Hebrew at ${localizedUrl('he', '/')}
- Contact: ${company.email}, ${company.phone}
- Location: ${company.location[locale]}

## Core Sources

${sourceLink('Company overview', '/ai-content/company.md', 'Who AI Crafters is, what it builds, and how to contact the team.')}
${sourceLink('Services overview', '/ai-content/services.md', 'AI agent development, workflow automation, BI AI, RAG, and integration services.')}
${sourceLink('Selected production use cases', '/ai-content/use-cases.md', 'Short summaries of production and rollout AI systems.')}
${sourceLink('FAQ', '/ai-content/faq.md', 'Answer-ready questions about AI Crafters and project fit.')}
${sourceLink('Founders', '/ai-content/founders.md', 'Leadership and founder context.')}

## Service Pages

${servicePages
  .map((service) =>
    sourceLink(service.title[locale], `/ai-content/services/${service.slug}.md`, service.description[locale])
  )
  .join('\n')}

## Use Cases

${useCases
  .map((useCase) =>
    sourceLink(useCase.title, `/ai-content/use-cases/${useCase.slug}.md`, useCase.summary)
  )
  .join('\n')}

## AEO and GEO Resources

${comparisonPages
  .map((page) =>
    sourceLink(page.title[locale], `/ai-content/compare/${page.slug}.md`, page.description[locale])
  )
  .join('\n')}
${resourcePages
  .map((page) =>
    sourceLink(page.title[locale], `/ai-content/resources/${page.slug}.md`, page.description[locale])
  )
  .join('\n')}

## Optional

${sourceLink('Careers', '/careers', 'Open roles and hiring information.')}
${sourceLink('Hebrew homepage', '/he', 'Hebrew-language version of the main site.')}
`;
};

export const renderCompanyMarkdown = () => `# ${company.name}

${company.description[locale]}

${company.valueProposition[locale]}

## Contact

- Website: ${absoluteUrl('/')}
- Email: ${company.email}
- Phone: ${company.phone}
- Location: ${company.location[locale]}

## Founders

${founders
  .map((founder) => `- ${founder.name[locale]}, ${founder.title[locale]}: ${founder.linkedin}`)
  .join('\n')}
`;

export const renderServicesMarkdown = () => `# ${company.name} services

${company.name} builds production AI systems around measurable operational workflows.

${servicePages
  .map(
    (service) => `## ${service.title[locale]}

${service.description[locale]}

Audience: ${service.audience[locale]}

Expected outcomes:
${list(service.outcomes[locale])}

Canonical page: ${localizedUrl(locale, `/services/${service.slug}`)}
Markdown source: ${absoluteUrl(`/ai-content/services/${service.slug}.md`)}
`
  )
  .join('\n')}
`;

export const renderServiceMarkdown = (slug: string) => {
  const service = getServicePage(slug);
  if (!service) return undefined;

  return `# ${service.title[locale]}

${service.eyebrow[locale]}

${service.description[locale]}

## Best Fit

${service.audience[locale]}

## Outcomes

${list(service.outcomes[locale])}

## Implementation Pattern

${list(service.process[locale])}

## Related Use Cases

${service.relatedUseCaseSlugs
  .map((useCaseSlug) => {
    const useCase = getUseCase(useCaseSlug, locale);
    if (!useCase) return '';
    return `- [${useCase.title}](${localizedUrl(locale, `/use-cases/${useCase.slug}`)}): ${useCase.summary}`;
  })
  .filter(Boolean)
  .join('\n')}

Canonical page: ${localizedUrl(locale, `/services/${service.slug}`)}
`;
};

export const renderUseCasesMarkdown = () => `# ${company.name} use cases

${getUseCases(locale)
  .map(
    (useCase) => `## ${useCase.title}

Client: ${useCase.client}

Status: ${useCase.status}

Metric: ${useCase.metric}

Summary: ${useCase.summary}

Canonical page: ${localizedUrl(locale, `/use-cases/${useCase.slug}`)}
`
  )
  .join('\n')}
`;

export const renderUseCaseMarkdown = (slug: string) => {
  const useCase = getUseCase(slug, locale);
  if (!useCase) return undefined;

  return `# ${useCase.title}

${useCase.eyebrow}

Client: ${useCase.client}

Status: ${useCase.status}

Metric: ${useCase.metric}

Metric context: ${useCase.metricDetail}

## Problem

${useCase.problem}

## What AI Crafters built

${list(useCase.built)}

## Business Impact

${useCase.impact}

## Proof Points

${list(useCase.proof)}

Canonical page: ${localizedUrl(locale, `/use-cases/${useCase.slug}`)}
`;
};

export const renderFaqMarkdown = () => `# ${company.name} FAQ

${faqs
  .map(
    (faq) => `## ${faq.question[locale]}

${faq.answer[locale]}
`
  )
  .join('\n')}
`;

export const renderFoundersMarkdown = () => `# ${company.name} founders

${founders
  .map(
    (founder) => `## ${founder.name[locale]}

Role: ${founder.title[locale]}

LinkedIn: ${founder.linkedin}
`
  )
  .join('\n')}
`;

export const renderComparisonMarkdown = (slug: string) => {
  const page = getComparisonPage(slug);
  if (!page) return undefined;

  return `# ${page.title[locale]}

${page.description[locale]}

${page.sections[locale].map((item) => `- ${item}`).join('\n')}

Canonical page: ${localizedUrl(locale, `/compare/${page.slug}`)}
`;
};

export const renderResourceMarkdown = (slug: string) => {
  const page = getResourcePage(slug);
  if (!page) return undefined;

  return `# ${page.title[locale]}

${page.description[locale]}

${list(page.items[locale])}

Canonical page: ${localizedUrl(locale, `/resources/${page.slug}`)}
`;
};

export const renderLlmsFullTxt = () =>
  [
    renderCompanyMarkdown(),
    renderServicesMarkdown(),
    renderUseCasesMarkdown(),
    renderFaqMarkdown(),
    renderFoundersMarkdown(),
    section(
      'AEO and GEO resources',
      [
        ...comparisonPages.map((page) => `- ${page.title[locale]}: ${localizedUrl(locale, `/compare/${page.slug}`)}`),
        ...resourcePages.map((page) => `- ${page.title[locale]}: ${localizedUrl(locale, `/resources/${page.slug}`)}`),
      ].join('\n')
    ),
    `Last updated: ${new Date().toISOString().slice(0, 10)}`,
  ].join('\n\n---\n\n');

export const renderAiMarkdown = (slug: string[]) => {
  const joined = slug.join('/');

  if (joined === 'company.md') return renderCompanyMarkdown();
  if (joined === 'services.md') return renderServicesMarkdown();
  if (joined === 'use-cases.md') return renderUseCasesMarkdown();
  if (joined === 'faq.md') return renderFaqMarkdown();
  if (joined === 'founders.md') return renderFoundersMarkdown();

  if (slug.length === 2 && slug[0] === 'services') {
    return renderServiceMarkdown(slug[1].replace(/\.md$/, ''));
  }

  if (slug.length === 2 && slug[0] === 'use-cases') {
    return renderUseCaseMarkdown(slug[1].replace(/\.md$/, ''));
  }

  if (slug.length === 2 && slug[0] === 'compare') {
    return renderComparisonMarkdown(slug[1].replace(/\.md$/, ''));
  }

  if (slug.length === 2 && slug[0] === 'resources') {
    return renderResourceMarkdown(slug[1].replace(/\.md$/, ''));
  }

  return undefined;
};
