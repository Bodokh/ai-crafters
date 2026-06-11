import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UseCaseDetail } from '@/components/use-cases/UseCaseDetail';
import {
  getRelatedUseCases,
  getUseCase,
  LocaleKey,
  useCaseSlugs,
} from '@/content/useCases';
import { routing } from '@/i18n/routing';

type UseCaseDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

export const generateStaticParams = () =>
  routing.locales.flatMap((locale) =>
    useCaseSlugs.map((slug) => ({
      locale,
      slug,
    }))
  );

export async function generateMetadata({
  params,
}: UseCaseDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = isLocaleKey(locale) ? locale : 'he';
  const useCase = getUseCase(slug, safeLocale);

  if (!useCase) {
    return {
      title: 'Use Case | AI Crafters',
    };
  }

  return {
    title: `${useCase.title} | AI Crafters`,
    description: useCase.summary,
  };
}

export default async function UseCaseDetailPage({ params }: UseCaseDetailPageProps) {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const useCase = getUseCase(slug, locale);

  if (!useCase) {
    notFound();
  }

  return (
    <UseCaseDetail
      locale={locale}
      useCase={useCase}
      relatedUseCases={getRelatedUseCases(slug, locale)}
    />
  );
}

