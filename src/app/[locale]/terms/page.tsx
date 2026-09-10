import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Terms } from '@/components/Terms';
import { JsonLd } from '@/components/JsonLd';
import { routing } from '@/i18n/routing';
import type { LocaleKey } from '@/content/useCases';
import { createPageMetadata, webPageJsonLd } from '@/lib/seo';

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

const termsSeoDescription = {
  en: 'Read the AI Crafters terms governing use of our website, AI development services, privacy, intellectual property, payments, and customer responsibilities.',
  he: 'קראו את תנאי השימוש של AI Crafters בנוגע לשימוש באתר, שירותי פיתוח AI, פרטיות, קניין רוחני, תשלומים ואחריות המשתמשים.',
} as const;

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const messages = (await import(`../../../../messages/${locale}.json`)).default;

  return createPageMetadata({
    locale,
    path: '/terms',
    title: `${messages.terms.title} | AI Crafters`,
    description: termsSeoDescription[locale],
  });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = `${messages.terms.title} | AI Crafters`;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          locale,
          path: '/terms',
          title,
          description: termsSeoDescription[locale],
        })}
      />
      <Terms />
    </>
  );
}
