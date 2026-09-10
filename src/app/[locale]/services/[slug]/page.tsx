import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Check, Target, UsersRound } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { ContactButton } from '@/components/SiteContactDialog';
import { ProjectInquiry } from '@/components/ProjectInquiry';
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
    <main className="aic-page aic-editorial-page">
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
            { name: service.title[locale], path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <section className="aic-hero aic-editorial-hero">
        <div className="aic-container">
          <p className="aic-eyebrow">
            {service.eyebrow[locale]}
          </p>
          <h1 className="aic-title">
            {service.title[locale]}
          </h1>
          <p className="aic-lead">
            {service.description[locale]}
          </p>
          <ContactButton className="aic-button mt-8">
            {locale === 'he' ? 'נדבר על הפרויקט שלכם' : 'Discuss your project'}
            <ArrowUpRight size={19} aria-hidden="true" />
          </ContactButton>
        </div>
      </section>

      <section className="aic-container aic-section aic-editorial-body">
        <div className="aic-editorial-fit-grid">
          <article className="aic-card aic-editorial-panel">
            <UsersRound className="aic-editorial-icon" size={26} strokeWidth={1.4} aria-hidden="true" />
            <h2 className="aic-editorial-heading">
              {locale === 'he' ? 'למי זה מתאים' : 'Best Fit'}
            </h2>
            <p className="aic-editorial-copy">
              {service.audience[locale]}
            </p>
          </article>

          <article className="aic-card aic-editorial-panel">
            <Target className="aic-editorial-icon" size={26} strokeWidth={1.4} aria-hidden="true" />
            <h2 className="aic-editorial-heading">
              {locale === 'he' ? 'מה נרצה להשיג' : 'What we aim to improve'}
            </h2>
            <ul className="aic-editorial-outcomes">
              {service.outcomes[locale].map((outcome) => (
                <li key={outcome}>
                  <Check size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="aic-card aic-editorial-panel aic-editorial-process">
          <h2 className="aic-editorial-heading">
            {locale === 'he' ? 'איך נבנה את הפתרון' : 'How we build your solution'}
          </h2>
          <ol className="aic-editorial-process-list" role="list">
            {service.process[locale].map((step, index) => (
              <li key={step}>
                <span className="aic-editorial-step" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="aic-editorial-copy">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </article>

        {relatedUseCases.length > 0 && (
          <section className="aic-editorial-related">
            <h2 className="aic-editorial-heading">
              {locale === 'he' ? 'דוגמאות מפרויקטים' : 'Explore related projects'}
            </h2>
            <div className="aic-editorial-related-grid">
              {relatedUseCases.map((useCase) => (
                <Link
                  key={useCase.slug}
                  href={`/use-cases/${useCase.slug}`}
                  className="aic-card aic-editorial-related-card"
                >
                  <p className="aic-editorial-metric">
                    {useCase.metric}
                  </p>
                  <h3 className="aic-editorial-heading">
                    {useCase.title}
                  </h3>
                  <p className="aic-editorial-copy">
                    {useCase.summary}
                  </p>
                  <ArrowUpRight className="aic-editorial-link-icon" size={22} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="aic-editorial-related" aria-labelledby="related-services-heading">
          <h2 id="related-services-heading" className="aic-editorial-heading">
            {locale === 'he' ? 'פתרונות AI נוספים' : 'Explore more AI services'}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3" role="list">
            {servicePages.filter((related) => related.slug !== service.slug).map((related) => (
              <li key={related.slug}>
                <Link href={`/services/${related.slug}`} className="underline underline-offset-4">
                  {related.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <ProjectInquiry locale={locale} />
      </section>
    </main>
  );
}
