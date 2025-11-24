'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export const Testimonials = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  
  return (
    <section className="py-24 bg-slate-950 border-b border-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-white mb-4">{t('testimonials.title')}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              quoteKey: 'testimonials.1.quote',
              roleKey: 'testimonials.1.role',
              author: "Sarah Jenkins",
              img: "https://picsum.photos/100/100?random=1"
            },
            {
              quoteKey: 'testimonials.2.quote',
              roleKey: 'testimonials.2.role',
              author: "Michael Chang",
              img: "https://picsum.photos/100/100?random=2"
            },
            {
              quoteKey: 'testimonials.3.quote',
              roleKey: 'testimonials.3.role',
              author: "Elena Rodriguez",
              img: "https://picsum.photos/100/100?random=3"
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 relative group hover:bg-slate-900/60 transition-colors"
            >
              {/* Conditional positioning for the quote icon */}
              <Quote className={`text-slate-700 absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'}`} size={40} />
              
              <p className="text-slate-300 mb-8 leading-relaxed relative z-10 font-sans">"{t(item.quoteKey)}"</p>
              <div className="flex items-center gap-4">
                <img src={item.img} alt={item.author} className="w-12 h-12 rounded-full border-2 border-slate-800" />
                <div>
                  <h4 className="text-white font-semibold">{item.author}</h4>
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
