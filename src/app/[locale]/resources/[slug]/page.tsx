import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { ProjectInquiry } from '@/components/ProjectInquiry';
import { getResourcePage, resourcePages } from '@/content/site';
import type { LocaleKey } from '@/content/useCases';
import { routing } from '@/i18n/routing';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  localizedUrl,
  webPageJsonLd,
} from '@/lib/seo';

type ResourcePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

export const generateStaticParams = () =>
  routing.locales.flatMap((locale) =>
    resourcePages.map((page) => ({
      locale,
      slug: page.slug,
    }))
  );

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const page = getResourcePage(slug);

  if (!page) {
    notFound();
  }

  return createPageMetadata({
    locale,
    path: `/resources/${page.slug}`,
    title: page.metaTitle[locale],
    description: page.description[locale],
    type: 'article',
  });
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const page = getResourcePage(slug);

  if (!page) {
    notFound();
  }

  setRequestLocale(locale);

  const path = `/resources/${page.slug}`;
  const checklistJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${localizedUrl(locale, path)}#checklist`,
    name: page.title[locale],
    description: page.description[locale],
    url: localizedUrl(locale, path),
    itemListElement: page.items[locale].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item,
    })),
  };

  return (
    <main className="aic-page aic-editorial-page">
      <JsonLd
        data={[
          webPageJsonLd({
            locale,
            path,
            title: page.metaTitle[locale],
            description: page.description[locale],
          }),
          checklistJsonLd,
          breadcrumbJsonLd(locale, [
            { name: 'AI Crafters', path: '/' },
            { name: page.title[locale], path },
          ]),
        ]}
      />

      <section className="aic-hero aic-editorial-hero">
        <div className="aic-container">
          <p className="aic-eyebrow">
            {locale === 'he' ? 'משאב להערכת ספקים' : 'Vendor evaluation resource'}
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
        <ol className="aic-editorial-checklist" role="list">
          {page.items[locale].map((item, index) => (
            <li key={item} className="aic-card aic-editorial-checklist-item">
              <span className="aic-editorial-step" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="aic-editorial-heading">
                {item}
              </h2>
            </li>
          ))}
        </ol>

        <ProjectInquiry locale={locale} currentPath={path} />
      </section>
    </main>
  );
}
