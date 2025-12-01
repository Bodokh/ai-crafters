'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Code, TrendingUp, Sparkles, Zap, Shield, Terminal, ChevronDown, CheckCircle2 } from 'lucide-react';
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

interface JobCardProps {
    jobId: string;
    tags: string[];
    tagColors: string[];
    icon: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    t: any;
    reqCount: number;
    advCount: number;
}

const JobCard: React.FC<JobCardProps> = ({ jobId, tags, tagColors, icon, isExpanded, onToggle, t, reqCount, advCount }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            layout
            className="relative group rounded-2xl bg-muted/40 border border-border overflow-hidden hover:border-cyan-500/50 transition-all duration-500"
        >
            {/* Glowing Border Top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-500"></div>

            <div className="p-8 md:p-10">
                {/* Header - Always Visible */}
                <div 
                    className="cursor-pointer"
                    onClick={onToggle}
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-muted border border-border text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t(`jobs.${jobId}.title`)}</h2>
                                <div className="flex flex-wrap gap-3">
                                    {tags.map((tag, i) => (
                                        <span 
                                            key={i} 
                                            className={`px-3 py-1 bg-muted rounded text-xs font-mono border border-border ${tagColors[i] || 'text-muted-foreground'}`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-2 rounded-full bg-muted border border-border text-muted-foreground hover:text-cyan-400 transition-colors"
                        >
                            <ChevronDown size={24} />
                        </motion.div>
                    </div>

                    {/* Brief Description - Always Visible */}
                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg border-l-2 border-brand-500 px-4 py-2 bg-muted/50 rounded-r text-foreground">
                            {t(`jobs.${jobId}.intro`)}
                        </p>
                    </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-8 text-muted-foreground font-sans leading-relaxed mt-6">
                                {/* Intro 2 */}
                                <p>{t(`jobs.${jobId}.intro2`)}</p>

                                {/* Requirements */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-xl font-bold text-foreground mb-4">
                                        <Zap className="text-yellow-400" size={20} />
                                        {t(`jobs.${jobId}.requirements.title`)}
                                    </h3>
                                    <ul className="space-y-3">
                                        {Array.from({ length: reqCount }, (_, i) => (
                                            <li key={i} className="flex items-start gap-3 group/item">
                                                <CheckCircle2 size={18} className="mt-1 text-muted-foreground group-hover/item:text-cyan-400 transition-colors shrink-0" />
                                                <span>{t(`jobs.${jobId}.req.${i + 1}`)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Advantages */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-xl font-bold text-foreground mb-4">
                                        <Shield className="text-brand-400" size={20} />
                                        {t(`jobs.${jobId}.advantages.title`)}
                                    </h3>
                                    <ul className="space-y-3">
                                        {Array.from({ length: advCount }, (_, i) => (
                                            <li key={i} className="flex items-start gap-3 group/item">
                                                <div className="mt-3 w-1.5 h-1.5 rounded-full bg-muted-foreground group-hover/item:bg-brand-400 transition-colors shrink-0"></div>
                                                <span>{t(`jobs.${jobId}.adv.${i + 1}`)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Footer/How to apply */}
                                <div className="mt-8 p-6 bg-muted rounded-xl border border-border">
                                    <div className="flex items-start gap-3">
                                        <Terminal className="text-cyan-500 mt-1" size={20} />
                                        <div className="flex-1">
                                            <h4 className="text-foreground font-bold mb-2">{t(`jobs.${jobId}.apply.instructions`)}</h4>
                                            <p className="text-sm text-muted-foreground mb-4">{t(`jobs.${jobId}.apply.details`)}</p>
                                            <code className="block dir-ltr bg-background p-3 rounded text-xs font-mono text-cyan-400 border border-border mb-4">
                                                &gt; send_cv --to careers@aicrafters.com --attach portfolio
                                            </code>
                                            <a 
                                                href="mailto:careers@aicrafters.com" 
                                                className="dark:scanline-effect inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                                            >
                                                {t(`jobs.${jobId}.apply.label`)}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Click to expand hint when collapsed */}
                {!isExpanded && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-muted-foreground mt-4 cursor-pointer hover:text-cyan-400 transition-colors"
                        onClick={onToggle}
                    >
                        {t('clickToExpand')}
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
};

export const Careers: React.FC = () => {
    const t = useTranslations('careers');
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    const jobs = [
        {
            id: 'aiEngineer',
            icon: <Sparkles size={24} />,
            tags: ['Full-time', 'Remote / Hybrid', 'Senior Level'],
            tagColors: ['text-cyan-400', 'text-brand-400', 'text-violet-400'],
            reqCount: 8,
            advCount: 4,
        },
        {
            id: 'seniorDev',
            icon: <Code size={24} />,
            tags: ['Full-time', 'Remote / Hybrid', 'Senior Level'],
            tagColors: ['text-cyan-400', 'text-brand-400', 'text-violet-400'],
            reqCount: 6,
            advCount: 4,
        },
        {
            id: 'juniorDev',
            icon: <Code size={24} />,
            tags: ['Full-time', 'Hybrid', 'Junior Level'],
            tagColors: ['text-cyan-400', 'text-brand-400', 'text-emerald-400'],
            reqCount: 5,
            advCount: 4,
        },
        {
            id: 'salesManager',
            icon: <TrendingUp size={24} />,
            tags: ['Full-time', 'Hybrid', 'Senior Level'],
            tagColors: ['text-cyan-400', 'text-brand-400', 'text-amber-400'],
            reqCount: 5,
            advCount: 4,
        },
    ];

    const toggleJob = (jobId: string) => {
        setExpandedJob(expandedJob === jobId ? null : jobId);
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-950/20 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-brand-400 text-xs font-mono mb-6"
                    >
                        <Briefcase size={14} />
                        <span>{t('hiring')}</span>
                    </motion.div>
                    
                    <h1 className="dark:scanline-effect font-display font-bold text-5xl md:text-6xl text-foreground mb-6 min-h-14">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-brand-500">
                            <DecodedText text={t('title') + ' ' + t('highlight')} delay={0.5} />
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-light">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Jobs List */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            jobId={job.id}
                            tags={job.tags}
                            tagColors={job.tagColors}
                            icon={job.icon}
                            isExpanded={expandedJob === job.id}
                            onToggle={() => toggleJob(job.id)}
                            t={t}
                            reqCount={job.reqCount}
                            advCount={job.advCount}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
