import type { Metadata } from 'next';
import Script from 'next/script';
import { JetBrains_Mono, Outfit, Rubik, Space_Grotesk } from 'next/font/google';
import { Locale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-outfit'
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-space-grotesk'
});

const rubik = Rubik({
    subsets: ['latin', 'hebrew'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-rubik'
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-jetbrains-mono'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
// Get OG image URL - use NEXT_PUBLIC_SITE_URL if available, otherwise use relative path
const getOgImageUrl = (): string => {
const logoPath = '/images/aic_on_black.png';
    
    if (siteUrl) {
        // Remove trailing slash if present and construct absolute URL
        const baseUrl = siteUrl.replace(/\/$/, '');
        return `${baseUrl}${logoPath}`;
    }
    
    return logoPath;
};

const ogImageUrl = getOgImageUrl();

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const locale = (resolvedParams?.locale as Locale) || 'he';
    
    // Load translations for metadata
    const messages = (await import(`../../../messages/${locale}.json`)).default;
    const metadata = messages.metadata || messages;

    const title = metadata.title || 'AI Crafters';
    const description = metadata.description || '';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: ogImageUrl,
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
            images: [ogImageUrl],
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
    const locale = resolvedParams?.locale as Locale || "he";
  
    // Providing all messages to the client
    // side is the easiest way to get started
    // getMessages() automatically detects locale from the [locale] route segment
    const messages = await getMessages();

    const dir = locale === 'he' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} className="scroll-smooth" suppressHydrationWarning>
            <head>
                {/* UserWay Accessibility Widget - Replace YOUR_ACCOUNT_ID with your UserWay account ID */}
                {/* The default icon is hidden - use the custom accessibility button in the navbar */}
                <Script
                    src="https://cdn.userway.org/widget.js"
                    data-account="YOUR_ACCOUNT_ID"
                    strategy="lazyOnload"
                />
                {/* Hide default UserWay icon - using custom trigger in navbar */}
                <style>{`
                    .userway_buttons_wrapper,
                    .uwy.userway_p3 {
                        display: none !important;
                    }
                `}</style>
                <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-title" content="AI Crafters" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body
                className={`${outfit.variable} ${spaceGrotesk.variable} ${rubik.variable} ${jetbrainsMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
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

