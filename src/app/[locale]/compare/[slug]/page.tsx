import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { ProjectInquiry } from '@/components/ProjectInquiry';
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
    <main className="aic-page aic-editorial-page">
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
            { name: page.title[locale], path: `/compare/${page.slug}` },
          ]),
        ]}
      />

      <section className="aic-hero aic-editorial-hero">
        <div className="aic-container">
          <p className="aic-eyebrow">
            {locale === 'he' ? 'השוואה לקבלת החלטה' : 'Decision comparison'}
          </p>
          <h1 className="aic-title">
            {page.title[locale]}
          </h1>
          <p className="aic-lead">
            {page.description[locale]}
          </p>
        </div>
      </section>

      <section className="aic-container aic-section aic-editorial-body">
        <div className="aic-card aic-editorial-comparison">
          {page.sections[locale].map((item) => (
            <article key={item}>
              <p className="aic-editorial-copy">
                {item}
              </p>
            </article>
          ))}
        </div>
        <ProjectInquiry locale={locale} currentPath={`/compare/${page.slug}`} />
      </section>
    </main>
  );
}
