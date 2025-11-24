'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

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

  const navLinks = [
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.process'), href: '#process' },
    { name: t('nav.work'), href: '#work' },
    { name: t('nav.contact'), href: '#contact' },
    { name: t('nav.careers'), href: '/careers' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md border-slate-800 py-4'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 group" aria-label="AI Crafters home">
          <Image
            src="/images/logo.png"
            alt="AI Crafters"
            width={120}
            height={40}
            className="h-10 w-auto object-contain transition-transform scale-150 group-hover:scale-[175%]"
            priority
          />
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-mono font-medium text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest relative group"
            >
              {link.name}
              <span className={`absolute -bottom-1 h-px bg-cyan-400 transition-all duration-300 w-0 group-hover:w-full ${dir === 'rtl' ? 'right-0' : 'left-0'}`}></span>
            </a>
          ))}
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-all"
          >
            <Globe size={14} />
            <span className="uppercase text-[10px] font-bold tracking-wider font-mono">{locale}</span>
          </button>

          <a
            href="#contact"
            className="px-6 py-2 bg-cyan-900/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-white hover:border-cyan-400 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {t('nav.start')}
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-4">
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-slate-300"
            >
                <Globe size={20} />
                <span className="uppercase text-xs font-bold">{locale}</span>
            </button>
            
            <button
                className="text-white hover:text-cyan-400 transition-colors"
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
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-mono font-medium text-slate-300 hover:text-cyan-400 uppercase"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
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
