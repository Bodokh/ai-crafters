'use client';

import { motion } from 'framer-motion';
import { Cpu, Mail, MapPin, PhoneCall, Send, SendHorizonal, Terminal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export const Contact = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const SendIcon = dir === 'rtl' ? SendHorizonal : Send;

  return (
    <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 text-cyan-500 mb-4 font-mono text-sm">
                <Terminal size={16} />
                <span>root@aicrafters:~# ./initiate_automation.sh</span>
            </div>
            <h2 className="font-display font-bold text-5xl text-white mb-6 leading-tight">
                <span className="scanline-effect inline-block">{t('contact.title.1')}</span> <br />
                <span className="scanline-effect inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400 animate-pulse">
                    {t('contact.title.2')}
                </span>
            </h2>
            <p className={`text-slate-400 text-lg mb-8 font-light font-sans ${dir === 'rtl' ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-slate-800`}>
              {t('contact.desc')}
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Mail, text: "automate@aicrafters.com", href: "mailto:automate@aicrafters.com" },
                { icon: PhoneCall, text: t('contact.coverage'), href: `tel:${t('contact.coverage')}` },
                { icon: MapPin, text: t('contact.location') }
              ].map((item, idx) => (
                <a key={idx} href={item.href} className="flex items-center gap-4 text-slate-300 group p-4 rounded-lg hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800">
                  <div className="text-brand-500 group-hover:text-cyan-400 transition-colors">
                    <item.icon size={24} />
                  </div>
                  <span className="text-lg font-mono">{item.text}</span>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-1 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950"
          >
            <div className="bg-black rounded-[22px] p-8 border border-slate-800">
                <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider">{t('contact.form.firstName')}</label>
                    <input type="text" className="w-full bg-slate-900/50 border border-slate-800 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all font-sans" />
                    </div>
                    <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider">{t('contact.form.lastName')}</label>
                    <input type="text" className="w-full bg-slate-900/50 border border-slate-800 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all font-sans" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider">{t('contact.form.email')}</label>
                    <input type="email" className="w-full bg-slate-900/50 border border-slate-800 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all font-sans" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider">{t('contact.form.message')}</label>
                    <textarea rows={4} className="w-full bg-slate-900/50 border border-slate-800 rounded-none px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all font-sans"></textarea>
                </div>

                <button type="submit" className="scanline-effect w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest uppercase rounded-none transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] group">
                    {t('contact.form.submit')} <SendIcon size={18} className={`transition-transform group-hover:-translate-x-2 ${dir === 'rtl' ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
                </button>
                </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
