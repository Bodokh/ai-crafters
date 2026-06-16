import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { UseCaseDetail } from '@/components/use-cases/UseCaseDetail';
import {
  getRelatedUseCases,
  getUseCase,
  LocaleKey,
  useCaseSlugs,
} from '@/content/useCases';
import { routing } from '@/i18n/routing';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  useCaseJsonLd,
  webPageJsonLd,
} from '@/lib/seo';

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
  const safeLocale = isLocaleKey(locale) ? locale : 'en';
  const useCase = getUseCase(slug, safeLocale);

  if (!useCase) {
    return {
      title: 'Use Case | AI Crafters',
    };
  }

  return createPageMetadata({
    locale: safeLocale,
    path: `/use-cases/${slug}`,
    title: `${useCase.title} | AI Crafters`,
    description: useCase.summary,
    type: 'article',
  });
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

  setRequestLocale(locale);

  const title = `${useCase.title} | AI Crafters`;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            locale,
            path: `/use-cases/${slug}`,
            title,
            description: useCase.summary,
          }),
          breadcrumbJsonLd(locale, [
            { name: 'AI Crafters', path: '/' },
            { name: 'Use cases', path: '/use-cases' },
            { name: useCase.title, path: `/use-cases/${slug}` },
          ]),
          useCaseJsonLd(locale, useCase),
        ]}
      />
      <UseCaseDetail
        locale={locale}
        useCase={useCase}
        relatedUseCases={getRelatedUseCases(slug, locale)}
      />
    </>
  );
}
