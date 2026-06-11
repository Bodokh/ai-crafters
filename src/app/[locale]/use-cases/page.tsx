import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UseCasesOverview } from '@/components/use-cases/UseCasesOverview';
import { getUseCases, LocaleKey, useCasesOverview } from '@/content/useCases';
import { routing } from '@/i18n/routing';

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocaleKey(locale) ? locale : 'he';

  return {
    title: `${useCasesOverview.title[safeLocale]} | AI Crafters`,
    description: useCasesOverview.description[safeLocale],
  };
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

  return <UseCasesOverview locale={locale} useCases={getUseCases(locale)} />;
}

