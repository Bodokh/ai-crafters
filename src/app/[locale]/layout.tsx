import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Rubik, Space_Grotesk } from 'next/font/google';
import { Locale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

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

export const metadata: Metadata = {
    title: 'AI Crafters | AI Agents & Automation',
    description:
        'A high-performance, animated landing page for AI Crafters showcasing modern web technologies and professional development services.'
};

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
    const messages = await getMessages();

    const dir = locale === 'he' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} className="scroll-smooth">
            <body
                className={`${outfit.variable} ${spaceGrotesk.variable} ${rubik.variable} ${jetbrainsMono.variable} bg-[#000206] text-[#e2e8f0]`}
            >
                <NextIntlClientProvider messages={messages}>
                    <Navbar />
                    {children}
                    <Footer />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

