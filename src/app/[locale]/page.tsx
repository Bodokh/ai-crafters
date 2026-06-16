import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AppContent } from '@/components/AppContent';
import { JsonLd } from '@/components/JsonLd';
import { routing } from '@/i18n/routing';
import { company } from '@/content/site';
import type { LocaleKey } from '@/content/useCases';
import {
  createPageMetadata,
  faqJsonLd,
  organizationJsonLd,
  serviceItemListJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return createPageMetadata({
    locale,
    title: messages.metadata.title,
    description: messages.metadata.description,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const title = messages.metadata.title;
  const description = messages.metadata.description || company.description[locale];

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(locale),
          websiteJsonLd(locale),
          webPageJsonLd({ locale, title, description }),
          serviceItemListJsonLd(locale),
          faqJsonLd(locale),
        ]}
      />
      <AppContent />
    </>
  );
}
