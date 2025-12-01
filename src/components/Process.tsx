'use client';

import { motion } from 'framer-motion';
import { Cpu, Map, Rocket, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export const Process = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  
  const steps = [
    {
      icon: Search,
      titleKey: 'process.1.title',
      descKey: 'process.1.desc'
    },
    {
      icon: Map,
      titleKey: 'process.2.title',
      descKey: 'process.2.desc'
    },
    {
      icon: Cpu,
      titleKey: 'process.3.title',
      descKey: 'process.3.desc'
    },
    {
      icon: Rocket,
      titleKey: 'process.4.title',
      descKey: 'process.4.desc'
    }
  ];

  return (
    <section id="process" className="py-16 bg-background relative overflow-hidden">
      {/* Circuit Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="dark:scanline-effect inline-block font-display font-bold text-4xl md:text-5xl text-foreground mb-4 tracking-tight">{t('process.title')}</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-brand-500 mx-auto rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light font-sans">{t('process.subtitle')}</p>
        </motion.div>

        {/* Mobile: stacked layout */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-1 rounded-2xl bg-gradient-to-br from-muted to-muted/50 group hover:from-cyan-500/50 hover:to-brand-500/50 transition-all duration-500">
                <div className="bg-background p-6 rounded-xl h-full relative overflow-hidden text-start">
                  <div className={`absolute top-0 p-3 opacity-10 text-7xl font-bold font-mono text-muted-foreground pointer-events-none ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>0{index+1}</div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="p-2.5 rounded-lg bg-muted text-cyan-400 border border-border group-hover:border-cyan-400/50 group-hover:text-foreground transition-colors">
                      <step.icon size={20} />
                    </div>
                    <h3 className="dark:scanline-effect text-lg font-bold text-foreground font-mono">{t(step.titleKey)}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm relative z-10 font-sans">{t(step.descKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: staggered grid layout */}
        <div className="hidden md:grid grid-cols-2 gap-x-8 gap-y-4 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={isEven ? 'mt-0' : 'mt-12'}
              >
                <div className="p-1 rounded-2xl bg-gradient-to-br from-muted to-muted/50 group hover:from-cyan-500/50 hover:to-brand-500/50 transition-all duration-500">
                  <div className="bg-background p-6 rounded-xl h-full relative overflow-hidden text-start">
                    <div className={`absolute top-0 p-3 opacity-10 text-8xl font-bold font-mono text-muted-foreground pointer-events-none ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>0{index+1}</div>
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="p-2.5 rounded-lg bg-muted text-cyan-400 border border-border group-hover:border-cyan-400/50 group-hover:text-foreground transition-colors">
                        <step.icon size={22} />
                      </div>
                      <h3 className="dark:scanline-effect text-lg font-bold text-foreground font-mono">{t(step.titleKey)}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm relative z-10 font-sans">{t(step.descKey)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
