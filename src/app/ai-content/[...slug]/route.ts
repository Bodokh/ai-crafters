import { notFound } from 'next/navigation';
import {
  comparisonPages,
  resourcePages,
  servicePages,
} from '@/content/site';
import { useCaseSlugs } from '@/content/useCases';
import { renderAiMarkdown } from '@/lib/ai-markdown';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [
    { slug: ['company.md'] },
    { slug: ['services.md'] },
    { slug: ['use-cases.md'] },
    { slug: ['faq.md'] },
    { slug: ['founders.md'] },
    ...servicePages.map((service) => ({
      slug: ['services', `${service.slug}.md`],
    })),
    ...useCaseSlugs.map((slug) => ({
      slug: ['use-cases', `${slug}.md`],
    })),
    ...comparisonPages.map((page) => ({
      slug: ['compare', `${page.slug}.md`],
    })),
    ...resourcePages.map((page) => ({
      slug: ['resources', `${page.slug}.md`],
    })),
  ];
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ slug: string[] }>;
  }
) {
  const { slug } = await params;
  const markdown = renderAiMarkdown(slug);

  if (!markdown) {
    notFound();
  }

  return new Response(markdown, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
