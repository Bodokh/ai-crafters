import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Careers } from '@/components/Careers';
import { JsonLd } from '@/components/JsonLd';
import { routing } from '@/i18n/routing';
import type { LocaleKey } from '@/content/useCases';
import { createPageMetadata, webPageJsonLd } from '@/lib/seo';

type CareersPageProps = {
    params: Promise<{ locale: string }>;
};

const isLocaleKey = (locale: string): locale is LocaleKey =>
    routing.locales.includes(locale as LocaleKey);

const careersSeo = {
    en: {
        title: 'AI Engineering Careers in Israel | AI Crafters',
        description: 'Join AI Crafters to build production-grade AI agents, workflow automation, and business systems with an experienced engineering team in Israel.',
    },
    he: {
        title: 'משרות פיתוח AI בישראל | AI Crafters',
        description: 'הצטרפו ל-AI Crafters ובנו איתנו סוכני AI, מערכות אוטומציה ופתרונות בינה מלאכותית לפרודקשן עם צוות הנדסי מנוסה בישראל.',
    },
} as const;

export async function generateMetadata({
    params,
}: CareersPageProps): Promise<Metadata> {
    const { locale } = await params;

    if (!isLocaleKey(locale)) {
        notFound();
    }

    const messages = (await import(`../../../../messages/${locale}.json`)).default;
    const { title, description } = careersSeo[locale];

    return createPageMetadata({
        locale,
        path: '/careers',
        title,
        description,
    });
}

export default async function CareersPage({ params }: CareersPageProps) {
    const { locale } = await params;

    if (!isLocaleKey(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    const messages = (await import(`../../../../messages/${locale}.json`)).default;
    const { title, description } = careersSeo[locale];

    return (
        <>
            <JsonLd
                data={webPageJsonLd({
                    locale,
                    path: '/careers',
                    title,
                    description,
                })}
            />
            <NextIntlClientProvider messages={{ careers: messages.careers }}>
                <Careers />
            </NextIntlClientProvider>
        </>
    );
}
