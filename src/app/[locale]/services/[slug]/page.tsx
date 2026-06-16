import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { getServicePage, servicePages } from '@/content/site';
import {
  getUseCase,
  type LocaleKey,
  type LocalizedUseCase,
} from '@/content/useCases';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  serviceJsonLd,
  webPageJsonLd,
} from '@/lib/seo';

type ServicePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const isLocaleKey = (locale: string): locale is LocaleKey =>
  routing.locales.includes(locale as LocaleKey);

const isLocalizedUseCase = (
  useCase: LocalizedUseCase | undefined
): useCase is LocalizedUseCase => Boolean(useCase);

export const generateStaticParams = () =>
  routing.locales.flatMap((locale) =>
    servicePages.map((service) => ({
      locale,
      slug: service.slug,
    }))
  );

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const service = getServicePage(slug);

  if (!service) {
    notFound();
  }

  return createPageMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: service.metaTitle[locale],
    description: service.description[locale],
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params;

  if (!isLocaleKey(locale)) {
    notFound();
  }

  const service = getServicePage(slug);

  if (!service) {
    notFound();
  }

  setRequestLocale(locale);

  const relatedUseCases = service.relatedUseCaseSlugs
    .map((useCaseSlug) => getUseCase(useCaseSlug, locale))
    .filter(isLocalizedUseCase);

  return (
    <main className="min-h-screen bg-background pt-24">
      <JsonLd
        data={[
          webPageJsonLd({
            locale,
            path: `/services/${service.slug}`,
            title: service.metaTitle[locale],
            description: service.description[locale],
          }),
          serviceJsonLd(locale, service),
          breadcrumbJsonLd(locale, [
            { name: 'AI Crafters', path: '/' },
            { name: locale === 'he' ? 'שירותים' : 'Services', path: '/' },
            { name: service.title[locale], path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
            {service.eyebrow[locale]}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl md:text-7xl font-bold leading-tight text-foreground">
            {service.title[locale]}
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-9 text-muted-foreground">
            {service.description[locale]}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="border border-border bg-card p-7 md:p-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {locale === 'he' ? 'למי זה מתאים' : 'Best Fit'}
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {service.audience[locale]}
            </p>
          </article>

          <article className="border border-border bg-card p-7 md:p-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {locale === 'he' ? 'תוצאות צפויות' : 'Expected Outcomes'}
            </h2>
            <ul className="mt-6 space-y-4">
              {service.outcomes[locale].map((outcome) => (
                <li key={outcome} className="text-base leading-7 text-muted-foreground">
                  {outcome}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="mt-8 border border-border bg-card p-7 md:p-8">
          <h2 className="font-display text-3xl font-bold text-foreground">
            {locale === 'he' ? 'איך אנחנו בונים את זה' : 'Implementation Pattern'}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {service.process[locale].map((step, index) => (
              <div key={step} className="border border-border bg-background p-5">
                <p className="text-xs font-mono text-cyan-600 dark:text-cyan-300">
                  0{index + 1}
                </p>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </article>

        {relatedUseCases.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {locale === 'he' ? 'Use cases קשורים' : 'Related Use Cases'}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {relatedUseCases.map((useCase) => (
                <Link
                  key={useCase.slug}
                  href={`/use-cases/${useCase.slug}`}
                  className="border border-border bg-card p-6 transition-colors hover:border-cyan-500"
                >
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {useCase.metric}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                    {useCase.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {useCase.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
