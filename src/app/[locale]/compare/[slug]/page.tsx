import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { comparisonPages, getComparisonPage } from '@/content/site';
import type { LocaleKey } from '@/content/useCases';
import { routing } from '@/i18n/routing';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  webPageJsonLd,
} from '@/lib/seo';

type ComparisonPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

export const generateStaticParams = () =>
  routing.locales.flatMap((locale) =>
    comparisonPages.map((page) => ({
      locale,
      slug: page.slug,
    }))
  );

export async function generateMetadata({
  params,
}: ComparisonPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const page = getComparisonPage(slug);

  if (!page) {
    notFound();
  }

  return createPageMetadata({
    locale,
    path: `/compare/${page.slug}`,
    title: page.metaTitle[locale],
    description: page.description[locale],
  });
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const page = getComparisonPage(slug);

  if (!page) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background pt-24">
      <JsonLd
        data={[
          webPageJsonLd({
            locale,
            path: `/compare/${page.slug}`,
            title: page.metaTitle[locale],
            description: page.description[locale],
          }),
          breadcrumbJsonLd(locale, [
            { name: 'AI Crafters', path: '/' },
            { name: locale === 'he' ? 'השוואות' : 'Comparisons', path: '/compare/ai-agency-vs-internal-ai-team' },
            { name: page.title[locale], path: `/compare/${page.slug}` },
          ]),
        ]}
      />

      <section className="container mx-auto px-6 py-16 md:py-24">
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
          {locale === 'he' ? 'השוואה לקבלת החלטה' : 'Decision comparison'}
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl md:text-7xl font-bold leading-tight text-foreground">
          {page.title[locale]}
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-muted-foreground">
          {page.description[locale]}
        </p>

        <div className="mt-12 grid gap-6">
          {page.sections[locale].map((item, index) => (
            <article key={item} className="border border-border bg-card p-7 md:p-8">
              <p className="text-xs font-mono text-cyan-600 dark:text-cyan-300">
                0{index + 1}
              </p>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {item}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
