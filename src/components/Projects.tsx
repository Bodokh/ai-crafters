'use client';

import { motion } from 'framer-motion';
import { Code2, Cpu, Database, ExternalLink, Github } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const Projects = () => {
    const t = useTranslations();

    const projects = [
        {
            titleKey: 'project.1.title',
            descKey: 'project.1.desc',
            tagKey: 'project.1.tag',
            icon: Code2,
            techs: ['RabbitMQ', 'GKE', 'ElasticSearch'],
            status: 'Active',
            externalLink: 'https://colors-ai.com'
        },
        {
            titleKey: 'project.2.title',
            descKey: 'project.2.desc',
            tagKey: 'project.2.tag',
            icon: Database,
            techs: ['GKE', 'Faiss', 'LangGraph'],
            status: 'Deployed',
            externalLink: 'https://app.roadprotect.co.il'
        },
        {
            titleKey: 'project.3.title',
            descKey: 'project.3.desc',
            tagKey: 'project.3.tag',
            icon: Cpu,
            techs: ['Qlik', 'LangGraph', 'ElasticSearch'],
            status: 'In Beta'
        }
    ];

    return (
        <section id="work" className="py-24 bg-background relative border-t border-border">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="dark:scanline-effect inline-block font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
                        {t('projects.title')} <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-brand-500">{t('projects.titleHighlight')}</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-light font-sans">
                        {t('projects.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg dark:hover:shadow-none transition-all duration-500"
                        >
                            {/* Holographic header effect */}
                            <div className="h-2 bg-linear-to-r from-cyan-500 via-brand-500 to-violet-500 opacity-70"></div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-muted rounded-lg text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300 shadow-sm dark:shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                        <project.icon size={24} />
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider py-1 px-2 rounded bg-muted text-muted-foreground border border-border">
                                        {project.status}
                                    </span>
                                </div>

                                <h3 className="dark:scanline-effect text-xl font-bold text-foreground mb-3 font-display">{t(project.titleKey)}</h3>
                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed font-sans h-20 group-hover:text-foreground transition-colors">
                                    {t(project.descKey)}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.techs.map((tech, ti) => (
                                        <span key={ti} className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border group-hover:border-cyan-500/30 transition-colors">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <span className="text-xs font-bold text-brand-600 dark:text-brand-500 uppercase tracking-widest">{t(project.tagKey)}</span>
                                    <div className="flex gap-3">
                                        {project.externalLink && <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                            <ExternalLink size={18} />
                                        </a>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* New Placeholders */}
                    {/* {[1, 2, 3].map((_, i) => (
                <motion.div
                     key={`placeholder-${i}`}
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                     className="flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl min-h-[300px] group hover:bg-slate-900/40 transition-colors"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <span className="text-4xl text-slate-700 font-thin group-hover:text-cyan-500/50 transition-colors">+</span>
                    </div>
                    <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">Project Slot {i + 1}</p>
                    <p className="text-slate-600 text-xs mt-2">Coming Soon</p>
                </motion.div>
            ))} */}
                </div>
            </div>
        </section>
    );
};
