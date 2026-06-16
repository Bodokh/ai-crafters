import type { Metadata } from 'next';
import { company, faqs, founders, servicePages, type ServicePage } from '@/content/site';
import type { LocalizedUseCase, LocaleKey } from '@/content/useCases';

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ai-crafters.com'
).replace(/\/$/, '');

export const defaultOgImage = '/images/aic_on_black.png';

export const localeNames: Record<LocaleKey, string> = {
  en: 'English',
  he: 'Hebrew',
};

export const localizedPath = (locale: LocaleKey, path = '/') => {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? normalizedPath || '/' : `/he${normalizedPath}`;
};

export const absoluteUrl = (path = '/') =>
  `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

export const localizedUrl = (locale: LocaleKey, path = '/') =>
  absoluteUrl(localizedPath(locale, path));

export const alternateLanguages = (path = '/') => ({
  en: localizedUrl('en', path),
  he: localizedUrl('he', path),
  'x-default': localizedUrl('en', path),
});

type PageMetadataInput = {
  locale: LocaleKey;
  path?: string;
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  robots?: Metadata['robots'];
};

export const createPageMetadata = ({
  locale,
  path = '/',
  title,
  description,
  image = defaultOgImage,
  type = 'website',
  robots,
}: PageMetadataInput): Metadata => {
  const canonical = localizedUrl(locale, path);
  const imageUrl = absoluteUrl(image);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
      languages: alternateLanguages(path),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: company.name,
      type,
      locale: locale === 'he' ? 'he_IL' : 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${company.name} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots,
  };
};

export const organizationJsonLd = (locale: LocaleKey) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: company.name,
  legalName: company.legalName,
  url: siteUrl,
  logo: absoluteUrl('/images/aic_on_black.png'),
  description: company.description[locale],
  email: company.email,
  telephone: company.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tel Aviv',
    addressCountry: 'IL',
  },
  founder: founders.map((founder) => ({
    '@type': 'Person',
    name: founder.name[locale],
    jobTitle: founder.title[locale],
    sameAs: founder.linkedin,
  })),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: company.email,
    telephone: company.phone,
    areaServed: ['IL', 'US'],
    availableLanguage: ['English', 'Hebrew'],
  },
});

export const websiteJsonLd = (locale: LocaleKey) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: company.name,
  url: siteUrl,
  inLanguage: localeNames[locale],
  publisher: {
    '@id': `${siteUrl}/#organization`,
  },
});

export const webPageJsonLd = ({
  locale,
  path = '/',
  title,
  description,
}: {
  locale: LocaleKey;
  path?: string;
  title: string;
  description: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${localizedUrl(locale, path)}#webpage`,
  url: localizedUrl(locale, path),
  name: title,
  description,
  inLanguage: localeNames[locale],
  isPartOf: {
    '@id': `${siteUrl}/#website`,
  },
  about: {
    '@id': `${siteUrl}/#organization`,
  },
});

export const serviceItemListJsonLd = (locale: LocaleKey) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${localizedUrl(locale, '/')}#services`,
  name: locale === 'he' ? 'שירותי AI Crafters' : 'AI Crafters services',
  itemListElement: servicePages.map((service, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: service.title[locale],
    url: localizedUrl(locale, `/services/${service.slug}`),
  })),
});

export const useCasesItemListJsonLd = (
  locale: LocaleKey,
  useCases: LocalizedUseCase[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${localizedUrl(locale, '/use-cases')}#use-cases`,
  name: locale === 'he' ? 'Use cases של AI Crafters' : 'AI Crafters use cases',
  itemListElement: useCases.map((useCase, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: useCase.title,
    url: localizedUrl(locale, `/use-cases/${useCase.slug}`),
    description: useCase.summary,
  })),
});

export const serviceJsonLd = (locale: LocaleKey, service: ServicePage) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${localizedUrl(locale, `/services/${service.slug}`)}#service`,
  name: service.title[locale],
  description: service.description[locale],
  provider: {
    '@id': `${siteUrl}/#organization`,
  },
  areaServed: ['Israel', 'United States'],
  serviceType: service.title[locale],
  url: localizedUrl(locale, `/services/${service.slug}`),
});

export const faqJsonLd = (locale: LocaleKey) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${localizedUrl(locale, '/')}#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question[locale],
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer[locale],
    },
  })),
});

export const breadcrumbJsonLd = (
  locale: LocaleKey,
  items: Array<{ name: string; path: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: localizedUrl(locale, item.path),
  })),
});

export const useCaseJsonLd = (locale: LocaleKey, useCase: LocalizedUseCase) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  '@id': `${localizedUrl(locale, `/use-cases/${useCase.slug}`)}#case-study`,
  name: useCase.title,
  headline: useCase.title,
  description: useCase.summary,
  url: localizedUrl(locale, `/use-cases/${useCase.slug}`),
  inLanguage: localeNames[locale],
  about: [useCase.valueTheme, useCase.client],
  provider: {
    '@id': `${siteUrl}/#organization`,
  },
  publisher: {
    '@id': `${siteUrl}/#organization`,
  },
});
