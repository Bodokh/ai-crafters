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
    <section id="process" className="py-24 bg-black relative overflow-hidden">
      {/* Circuit Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="scanline-effect inline-block font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-tight">{t('process.title')}</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-brand-500 mx-auto rounded-full mb-6"></div>
          <p className="text-slate-400 max-w-2xl mx-auto font-light font-sans">{t('process.subtitle')}</p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden md:block transform -translate-x-1/2">
                <div className="absolute top-0 bottom-0 w-full bg-gradient-to-b from-cyan-500 via-brand-500 to-violet-500 animate-pulse opacity-50"></div>
            </div>
            
            {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                
                return (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className={`flex flex-col md:flex-row items-center gap-8 mb-20 relative ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                    <div className="flex-1 w-full md:w-1/2">
                         <div className="p-1 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 group hover:from-cyan-500/50 hover:to-brand-500/50 transition-all duration-500">
                            <div className="bg-slate-950 p-8 rounded-xl h-full relative overflow-hidden text-start">
                                <div className={`absolute top-0 p-4 opacity-10 text-9xl font-bold font-mono text-slate-700 pointer-events-none ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>0{index+1}</div>
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className="p-3 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800 group-hover:border-cyan-400/50 group-hover:text-white transition-colors">
                                        <step.icon size={24} />
                                    </div>
                                    <h3 className="scanline-effect text-xl font-bold text-white font-mono">{t(step.titleKey)}</h3>
                                </div>
                                <p className="text-slate-400 leading-relaxed text-sm relative z-10 font-sans">{t(step.descKey)}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Center Node */}
                    <div className="w-4 h-4 rounded-full bg-black border-2 border-cyan-500 z-10 flex-shrink-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                    
                    <div className="flex-1 w-full md:w-1/2 hidden md:block"></div>
                </motion.div>
            )})}
        </div>
      </div>
    </section>
  );
};
