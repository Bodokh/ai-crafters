'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Menu, X, Accessibility } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';

// Declare UserWay global type
declare global {
  interface Window {
    UserWay?: {
      widgetOpen: () => void;
    };
  }
}

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'he' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  const openAccessibilityWidget = () => {
    if (window.UserWay) {
      window.UserWay.widgetOpen();
    }
  };

  // Check if we're on the home page
  // With localePrefix 'as-needed', pathname is always without locale prefix
  const isHomePage = pathname === '/';
  
  // Helper function to get the correct href for anchor links
  const getAnchorHref = (anchor: string) => {
    if (isHomePage) {
      return anchor;
    }
    // If not on home page, navigate to home page with anchor
    // Since localePrefix is 'as-needed', Hebrew (default) doesn't need prefix
    const homePath = locale === 'he' ? '/' : `/${locale}`;
    return `${homePath}${anchor}`;
  };

  const navLinks = [
    { name: t('nav.services'), href: getAnchorHref('#services') },
    { name: t('nav.process'), href: getAnchorHref('#process') },
    { name: t('nav.work'), href: getAnchorHref('#work') },
    { name: t('nav.about'), href: getAnchorHref('#about') },
    { name: t('nav.contact'), href: getAnchorHref('#contact') },
    { name: t('nav.careers'), href: '/careers' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
          ? 'bg-background/80 backdrop-blur-md border-border py-4'
          : 'bg-transparent border-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 group text-foreground/80 hover:text-cyan-400 transition-colors" aria-label="AI Crafters home">
          <Image
            src="/images/logo.png"
            alt="AI Crafters"
            width={120}
            height={40}
            className="h-10 w-auto object-contain transition-transform scale-150 group-hover:scale-[175%] dark:brightness-100 brightness-0"
            priority
          />
          <div className="text-xs font-mono font-medium uppercase tracking-widest relative group">
            AI Crafters
          </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-mono font-medium text-foreground/80 hover:text-cyan-400 transition-colors uppercase tracking-widest relative group"
            >
              {link.name}
              <span className={`absolute -bottom-1 h-px bg-cyan-400 transition-all duration-300 w-0 group-hover:w-full ${dir === 'rtl' ? 'right-0' : 'left-0'}`}></span>
            </a>
          ))}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-cyan-500/50 text-foreground/80 hover:text-cyan-400 hover:bg-muted transition-all"
          >
            <Globe size={14} />
            <span className="uppercase text-[10px] font-bold tracking-wider font-mono">{locale}</span>
          </button>

          <ThemeToggle />

          <button
            onClick={openAccessibilityWidget}
            className="group p-2 rounded-full border border-border hover:border-purple-500/50 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            aria-label={locale === 'he' ? 'אפשרויות נגישות' : 'Accessibility options'}
            title={locale === 'he' ? 'נגישות' : 'Accessibility'}
          >
            <Accessibility 
              size={18} 
              className="text-cyan-500 group-hover:text-purple-500 transition-colors"
            />
          </button>

          <a
            href={getAnchorHref('#contact')}
            className="px-6 py-2 bg-cyan-900/5 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-white hover:border-cyan-400 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {t('nav.start')}
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={openAccessibilityWidget}
            className="p-1.5 text-cyan-500 hover:text-purple-500 transition-colors"
            aria-label={locale === 'he' ? 'אפשרויות נגישות' : 'Accessibility options'}
          >
            <Accessibility size={20} />
          </button>
          
          <ThemeToggle />
          
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <Globe size={20} />
            <span className="uppercase text-xs font-bold">{locale}</span>
          </button>

          <button
            className="text-foreground hover:text-cyan-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-mono font-medium text-muted-foreground hover:text-cyan-400 uppercase"
                >
                  {link.name}
                </a>
              ))}
              <a
                href={getAnchorHref('#contact')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 px-6 py-3 bg-cyan-600 text-center text-white font-mono font-bold uppercase tracking-widest"
              >
                {t('nav.start')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
