'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code, Cpu, Database, Shield, Zap, CheckCircle2, Terminal } from 'lucide-react';
import { useTranslations } from 'next-intl';

const DecodedText: React.FC<{ text: string, className?: string, delay?: number }> = ({ text, className, delay = 0 }) => {
    const [displayText, setDisplayText] = useState('');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    
    useEffect(() => {
        let iteration = 0;
        let interval: any = null;
        
        const start = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText(text.split("").map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(""));
                
                if (iteration >= text.length) {
                    clearInterval(interval);
                }
                
                iteration += 1 / 3;
            }, 30);
        }, delay * 1000);

        return () => {
            clearTimeout(start);
            clearInterval(interval);
        };
    }, [text, delay]);

    return <span className={className}>{displayText}</span>;
}

export const Careers: React.FC = () => {
  const t = useTranslations('careers');
  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-brand-950/20 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-brand-400 text-xs font-mono mb-6"
                >
                    <Briefcase size={14} />
                    <span>{t('hiring')}</span>
                </motion.div>
                
                <h1 className="scanline-effect font-display font-bold text-5xl md:text-6xl text-white mb-6 min-h-14">
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-brand-500"><DecodedText text={t('title') + ' ' + t('highlight')} delay={0.5} /></span>
                </h1>
                <p className="text-slate-400 text-lg font-light">
                    {t('subtitle')}
                </p>
            </div>

            {/* Job Listing */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-4xl mx-auto"
            >
                <div className="relative group rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-colors duration-500">
                    {/* Glowing Border Top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 via-brand-500 to-violet-500"></div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{t('job.title')}</h2>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1 bg-slate-800 rounded text-xs text-cyan-400 font-mono border border-slate-700">Full-time</span>
                                    <span className="px-3 py-1 bg-slate-800 rounded text-xs text-brand-400 font-mono border border-slate-700">Remote / Hybrid</span>
                                    <span className="px-3 py-1 bg-slate-800 rounded text-xs text-violet-400 font-mono border border-slate-700">Senior Level</span>
                                </div>
                            </div>
                            <a href="mailto:careers@aicrafters.com" className="scanline-effect px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                                {t('job.apply.label')}
                            </a>
                        </div>

                        <div className="space-y-8 text-slate-300 font-sans leading-relaxed">
                            {/* Intro */}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg border-l-2 border-brand-500 pl-4 py-2 bg-slate-900/50 rounded-r">
                                    {t('job.intro')}
                                </p>
                                <p className="mt-4">
                                    {t('job.intro2')}
                                </p>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                                    <Zap className="text-yellow-400" size={20} />
                                    {t('job.requirements.title')}
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        'job.req.1', 'job.req.2', 'job.req.3', 'job.req.4',
                                        'job.req.5', 'job.req.6', 'job.req.7', 'job.req.8'
                                    ].map((req, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <CheckCircle2 size={18} className="mt-1 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                                            <span>{t(req)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Advantages */}
                            <div>
                                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                                    <Shield className="text-brand-400" size={20} />
                                    {t('job.advantages.title')}
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        'job.adv.1', 'job.adv.2', 'job.adv.3', 'job.adv.4'
                                    ].map((adv, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <div className="mt-3 w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-brand-400 transition-colors shrink-0"></div>
                                            <span>{t(adv)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer/How to apply */}
                            <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="flex items-start gap-3">
                                    <Terminal className="text-cyan-500 mt-1" size={20} />
                                    <div>
                                        <h4 className="text-white font-bold mb-2">{t('job.apply.instructions')}</h4>
                                        <p className="text-sm text-slate-400 mb-4">{t('job.apply.details')}</p>
                                        <code className="block dir-ltr bg-black p-3 rounded text-xs font-mono text-cyan-400 border border-slate-800">
                                            &gt; send_cv --to careers@aicrafters.com --attach portfolio
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
  );
};