'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
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
    <section className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('lastUpdated')}: {isHebrew ? 'דצמבר 2024' : 'December 2024'}
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const listItems = section.hasList ? t.raw(`${section.key}.list`) as string[] : null;
            
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 shadow-sm"
              >
                <div className={`flex items-start gap-4 ${isHebrew ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                    <Icon className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-3 font-outfit">
                      {t(`${section.key}.title`)}
                    </h2>
                    <div className="text-muted-foreground space-y-2 leading-relaxed">
                      <p>{t(`${section.key}.content`)}</p>
                      {listItems && Array.isArray(listItems) && (
                        <ul className={`list-disc ${isHebrew ? 'mr-6' : 'ml-6'} space-y-1 mt-3`}>
                          {listItems.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-12 text-center bg-card border border-border rounded-lg p-8"
        >
          <h2 className="text-xl font-semibold mb-4 font-outfit">{t('contact.title')}</h2>
          <p className="text-muted-foreground mb-4">{t('contact.content')}</p>
          <a
            href="mailto:automate@aicrafters.com"
            className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <Mail className="w-4 h-4" />
            automate@aicrafters.com
          </a>
        </motion.div>

        {/* Amendment 13 Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>{t('amendment13Notice')}</p>
        </motion.div>
      </div>
    </section>
  );
};

