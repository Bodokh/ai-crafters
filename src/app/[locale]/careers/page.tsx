import type { Metadata } from 'next';
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

export async function generateMetadata({
    params,
}: CareersPageProps): Promise<Metadata> {
    const { locale } = await params;

    if (!isLocaleKey(locale)) {
        notFound();
    }

    const messages = (await import(`../../../../messages/${locale}.json`)).default;
    const title = `${messages.careers.title} ${messages.careers.highlight} | AI Crafters`;

    return createPageMetadata({
        locale,
        path: '/careers',
        title,
        description: messages.careers.subtitle,
    });
}

export default async function CareersPage({ params }: CareersPageProps) {
    const { locale } = await params;

    if (!isLocaleKey(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    const messages = (await import(`../../../../messages/${locale}.json`)).default;
    const title = `${messages.careers.title} ${messages.careers.highlight} | AI Crafters`;

    return (
        <>
            <JsonLd
                data={webPageJsonLd({
                    locale,
                    path: '/careers',
                    title,
                    description: messages.careers.subtitle,
                })}
            />
            <Careers />
        </>
    );
}
