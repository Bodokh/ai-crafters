import { useLocale, useTranslations } from 'next-intl';
import { FileText, Shield, CreditCard, Clock, UserCheck, Database, Scale, AlertTriangle, Gavel, Mail } from 'lucide-react';

export const Terms = () => {
  const t = useTranslations('terms');
  const locale = useLocale();
  const isHebrew = locale === 'he';

  const sections = [
    { icon: FileText, key: 'intro', hasList: false },
    { icon: Shield, key: 'company', hasList: true },
    { icon: CreditCard, key: 'services', hasList: true },
    { icon: Clock, key: 'pricing', hasList: false },
    { icon: UserCheck, key: 'cancellation', hasList: false },
    { icon: Database, key: 'userRights', hasList: true },
    { icon: Scale, key: 'privacy', hasList: false },
    { icon: AlertTriangle, key: 'ip', hasList: false },
    { icon: Gavel, key: 'liability', hasList: false },
    { icon: Mail, key: 'disputes', hasList: false },
  ];

  return (
    <main className="aic-page terms-page">
      <div className="aic-container terms-container">
        <header className="aic-hero terms-hero">
          <h1 className="aic-title">
            {t('title')}
          </h1>
          <p className="terms-updated">
            {t('lastUpdated')}: {isHebrew ? 'דצמבר 2024' : 'December 2024'}
          </p>
        </header>

        <div className="aic-card terms-document">
          {sections.map((section) => {
            const Icon = section.icon;
            const listItems = section.hasList ? t.raw(`${section.key}.list`) as string[] : null;
            
            return (
              <section
                key={section.key}
                className="terms-section"
              >
                <div className="terms-section__layout">
                  <div className="terms-section__icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="terms-section__body">
                    <h2 className="terms-section__title">
                      {t(`${section.key}.title`)}
                    </h2>
                    <div className="terms-section__copy">
                      <p>{t(`${section.key}.content`)}</p>
                      {listItems && Array.isArray(listItems) && (
                        <ul>
                          {listItems.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Section */}
        <section className="aic-card terms-contact">
          <h2 className="terms-section__title">{t('contact.title')}</h2>
          <p className="terms-contact__copy">{t('contact.content')}</p>
          <a
            href="mailto:automate@ai-crafters.com"
            className="aic-text-link"
          >
            <Mail size={17} aria-hidden="true" />
            automate@ai-crafters.com
          </a>
        </section>

        {/* Amendment 13 Notice */}
        <div className="terms-notice">
          <p>{t('amendment13Notice')}</p>
        </div>
      </div>
    </main>
  );
};
