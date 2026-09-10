'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Globe2, Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { ContactButton } from '@/components/SiteContactDialog';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isHebrew = locale === 'he';
  const routeHref = (path: string) => (isHebrew ? `/he${path === '/' ? '' : path}` : path);
  const languageHref = isHebrew ? pathname : `/he${pathname === '/' ? '' : pathname}`;
  const languageLabel = isHebrew ? 'מעבר לאנגלית' : 'Switch to Hebrew';
  const contactLabel = t('nav.start');
  const menuLabel = isHebrew ? 'תפריט' : 'Menu';
  const links = [
    { label: t('nav.services'), path: '/', section: 'services' },
    { label: t('nav.work'), path: '/use-cases' },
    { label: t('nav.careers'), path: '/careers' },
  ];

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const desktop = window.matchMedia('(min-width: 961px)');
    const onDesktop = () => {
      if (desktop.matches) setIsMobileMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="aic-header" ref={headerRef}>
      <div className="aic-header__inner aic-container">
        <a
          href={routeHref('/')}
          className="aic-brand"
          aria-label={isHebrew ? 'AI Crafters — דף הבית' : 'AI Crafters home'}
          onClick={closeMenu}
        >
          <span className="aic-brand__mark">
            <Image src="/images/logo.png" width={116} height={116} alt="" priority />
          </span>
          <span className="aic-brand__name" dir="ltr">AI CRAFTERS</span>
        </a>

        <nav className="aic-header__desktop-nav" aria-label={isHebrew ? 'ניווט ראשי' : 'Main navigation'}>
          {links.map(({ label, path, section }) => (
            <a
              key={path}
              className="aic-header__link"
              href={`${routeHref(path)}${section ? `#${section}` : ''}`}
              aria-current={!section && (pathname === path || pathname.startsWith(`${path}/`)) ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
          <a href={languageHref} className="aic-header__language" aria-label={languageLabel}>
            <Globe2 size={15} aria-hidden="true" />
            <span>{isHebrew ? 'EN' : 'HE'}</span>
          </a>
        </nav>

        <div className="aic-header__actions">
          <ContactButton className="aic-button aic-button--secondary aic-header__contact" onClick={closeMenu}>
            {contactLabel}
            <ArrowUpRight size={17} aria-hidden="true" />
          </ContactButton>
          <button
            ref={menuButtonRef}
            type="button"
            className="aic-header__menu-toggle"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? (isHebrew ? 'סגירת תפריט' : 'Close menu') : (isHebrew ? 'פתיחת תפריט' : 'Open menu')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="aic-mobile-navigation"
          >
            <span>{menuLabel}</span>
            {isMobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav
        id="aic-mobile-navigation"
        className="aic-header__mobile-nav"
        aria-label={isHebrew ? 'ניווט לנייד' : 'Mobile navigation'}
        hidden={!isMobileMenuOpen}
      >
        {links.map(({ label, path, section }) => (
          <a
            key={path}
            href={`${routeHref(path)}${section ? `#${section}` : ''}`}
            onClick={closeMenu}
            aria-current={!section && (pathname === path || pathname.startsWith(`${path}/`)) ? 'page' : undefined}
          >
            {label}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        ))}
        <a href={languageHref} className="aic-header__mobile-language" onClick={closeMenu} lang={isHebrew ? 'en' : 'he'}>
          <span><Globe2 size={17} aria-hidden="true" /> {isHebrew ? 'English' : 'עברית'}</span>
          <span className="aic-header__language-code" aria-hidden="true">{isHebrew ? 'EN' : 'HE'}</span>
        </a>
      </nav>
    </header>
  );
};
