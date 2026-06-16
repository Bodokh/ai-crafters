import type { Metadata } from 'next';
import Script from 'next/script';
import { JetBrains_Mono, Rubik } from 'next/font/google';
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { company } from '@/content/site';
import { defaultOgImage, siteUrl, absoluteUrl } from '@/lib/seo';

const rubik = Rubik({
    subsets: ['latin', 'hebrew'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-rubik'
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-jetbrains-mono'
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const locale = resolvedParams?.locale;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    
    const messages = (await import(`../../../messages/${locale}.json`)).default;
    const metadata = messages.metadata || messages;

    const title = metadata.title || 'AI Crafters';
    const description = metadata.description || company.description[locale];
    const imageUrl = absoluteUrl(defaultOgImage);

    return {
        metadataBase: new URL(siteUrl),
        applicationName: company.name,
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: company.name,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'AI Crafters Logo',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const locale = resolvedParams?.locale;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
  
    const messages = await getMessages();

    const dir = locale === 'he' ? 'rtl' : 'ltr';

    return (
        <html lang={locale as Locale} dir={dir} className="scroll-smooth" suppressHydrationWarning>
            <head>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=AW-17903861190"
                    strategy="lazyOnload"
                />
                <Script id="google-analytics" strategy="lazyOnload">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'AW-17903861190');
                    `}
                </Script>
                <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-title" content="AI Crafters" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body
                className={`${rubik.variable} ${jetbrainsMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
            >
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider
                         attribute="class"
                         defaultTheme="system"
                         enableSystem={true}
                         disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                        <Footer />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
