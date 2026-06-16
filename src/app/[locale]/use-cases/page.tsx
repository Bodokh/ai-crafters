import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { UseCasesOverview } from '@/components/use-cases/UseCasesOverview';
import { getUseCases, LocaleKey, useCasesOverview } from '@/content/useCases';
import { routing } from '@/i18n/routing';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  useCasesItemListJsonLd,
  webPageJsonLd,
} from '@/lib/seo';

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocaleKey(locale) ? locale : 'en';

  return createPageMetadata({
    locale: safeLocale,
    path: '/use-cases',
    title: `${useCasesOverview.title[safeLocale]} | AI Crafters`,
    description: useCasesOverview.description[safeLocale],
  });
}

export default async function UseCasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const useCases = getUseCases(locale);
  const title = `${useCasesOverview.title[locale]} | AI Crafters`;
  const description = useCasesOverview.description[locale];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ locale, path: '/use-cases', title, description }),
          breadcrumbJsonLd(locale, [
            { name: 'AI Crafters', path: '/' },
            { name: useCasesOverview.title[locale], path: '/use-cases' },
          ]),
          useCasesItemListJsonLd(locale, useCases),
        ]}
      />
      <UseCasesOverview locale={locale} useCases={useCases} />
    </>
  );
}
