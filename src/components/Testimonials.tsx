'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

export const Testimonials = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <section className="py-24 bg-background border-b border-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t('testimonials.title')}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              quoteKey: 'testimonials.1.quote',
              nameKey: 'testimonials.1.name',
              roleKey: 'testimonials.1.role',
              img: '/images/testimonials/yogev-moyal.jpeg'
            },
            {
              quoteKey: 'testimonials.2.quote',
              nameKey: 'testimonials.2.name',
              roleKey: 'testimonials.2.role',
              img: '/images/testimonials/nadia-senft.jpeg'
            },
            {
              quoteKey: 'testimonials.3.quote',
              nameKey: 'testimonials.3.name',
              roleKey: 'testimonials.3.role',
              img: '/images/testimonials/saar-litmanovitz.jpeg'
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`py-8 px-16 rounded-2xl bg-muted/40 border border-border relative group hover:bg-muted/60 transition-colors flex flex-col justify-between`}
            >
              {/* Conditional positioning for the quote icon */}
              <Quote className={`text-muted-foreground absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'}`} size={40} />

              <p className={`text-muted-foreground mb-8 leading-relaxed relative z-10 font-sans`}>"{t(item.quoteKey)}"</p>
              <div className="flex items-center gap-4">
                <Image src={item.img} alt={t(item.nameKey)} width={48} height={48} className="w-12 h-12 rounded-full border-2 border-border" />
                <div>
                  <h4 className="text-foreground font-semibold">{t(item.nameKey)}</h4>
                  <span className="text-sm text-brand-400">{t(item.roleKey)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
