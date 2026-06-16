import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { getResourcePage, resourcePages } from '@/content/site';
import type { LocaleKey } from '@/content/useCases';
import { routing } from '@/i18n/routing';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  localizedPath,
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
  const contactHref = `${localizedPath(locale, '/')}#contact`;
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${localizedUrl(locale, path)}#checklist`,
    name: page.title[locale],
    description: page.description[locale],
    url: localizedUrl(locale, path),
    inLanguage: locale === 'he' ? 'Hebrew' : 'English',
    step: page.items[locale].map((item, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: item,
      text: item,
    })),
  };

  return (
    <main className="min-h-screen bg-background pt-24">
      <JsonLd
        data={[
          webPageJsonLd({
            locale,
            path,
            title: page.metaTitle[locale],
            description: page.description[locale],
          }),
          howToJsonLd,
          breadcrumbJsonLd(locale, [
            { name: 'AI Crafters', path: '/' },
            { name: locale === 'he' ? 'משאבים' : 'Resources', path },
            { name: page.title[locale], path },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
            {locale === 'he' ? 'משאב להערכת ספקים' : 'Vendor evaluation resource'}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-tight text-foreground md:text-7xl">
            {page.title[locale]}
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-9 text-muted-foreground">
            {page.description[locale]}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-4xl gap-5">
          {page.items[locale].map((item, index) => (
            <article key={item} className="border border-border bg-card p-6 md:p-8">
              <p className="font-mono text-xs text-cyan-600 dark:text-cyan-300">
                0{index + 1}
              </p>
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                {item}
              </h2>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl border border-cyan-500/30 bg-cyan-500/5 p-7 md:p-8">
          <h2 className="font-display text-3xl font-bold text-foreground">
            {locale === 'he' ? 'רוצים לבדוק התאמה לפרויקט?' : 'Need to evaluate a real project?'}
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            {locale === 'he'
              ? 'שלחו לנו תיאור קצר של התהליך, מקורות הדאטה והמטרה העסקית. נחזור עם הערכת היתכנות וכיוון יישום.'
              : 'Send a short description of the workflow, data sources, and business outcome. We will respond with feasibility notes and an implementation direction.'}
          </p>
          <a
            href={contactHref}
            className="mt-6 inline-flex border border-cyan-500 bg-cyan-600 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-cyan-500"
          >
            {locale === 'he' ? 'דברו איתנו' : 'Talk to us'}
          </a>
        </div>
      </section>
    </main>
  );
}
