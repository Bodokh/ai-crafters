import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === 'he';
  const routeHref = (path: string) => (isHebrew ? `/he${path === '/' ? '' : path}` : path);

  return (
    <footer className="aic-footer">
      <div className="aic-footer__inner">
        <a href={routeHref('/')} className="aic-footer__brand" aria-label={isHebrew ? 'AI Crafters — דף הבית' : 'AI Crafters home'}>
          <span className="aic-footer__mark">
            <Image src="/images/logo.png" width={88} height={88} alt="" loading="lazy" />
          </span>
          <span className="aic-footer__wordmark" dir="ltr">AI CRAFTERS</span>
        </a>
        <nav className="aic-footer__nav" aria-label={isHebrew ? 'ניווט בתחתית העמוד' : 'Footer navigation'}>
          <a href={routeHref('/use-cases')}>{t('nav.work')}</a>
          <a href={routeHref('/careers')}>{t('nav.careers')}</a>
          <a href={routeHref('/terms')} aria-label={t('footer.terms')}>{isHebrew ? 'תנאים' : 'Terms'}</a>
        </nav>
        <div className="aic-footer__contact">
          <a href="mailto:automate@ai-crafters.com" dir="ltr">automate@ai-crafters.com</a>
          <a href="tel:+972542177133" dir="ltr">+972 54-217-7133</a>
        </div>
        <div className="aic-footer__meta">
          <span>{isHebrew ? 'תל אביב, ישראל' : 'Tel Aviv, Israel'}</span>
          <small dir="ltr">© {new Date().getFullYear()} AI Crafters</small>
        </div>
      </div>
    </footer>
  );
};
