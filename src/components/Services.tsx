'use client';

import { ElementType, MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Database, Network, Share2, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceCardProps {
    titleKey: string;
    descKey: string;
    icon: ElementType;
    index: number;
}

const ServiceCard = ({ titleKey, descKey, icon: Icon, index }: ServiceCardProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const t = useTranslations();

    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <motion.div
            ref={divRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative h-full bg-card border border-border p-8 overflow-hidden group hover:border-brand-500/50 hover:shadow-lg dark:hover:shadow-none transition-all duration-500"
        >
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-cyan-400 group-hover:border-cyan-400 transition-colors"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-border group-hover:border-cyan-400 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-border group-hover:border-cyan-400 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-border group-hover:border-cyan-400 transition-colors"></div>

            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.1), transparent 40%)`,
                }}
            />

            <div className="relative z-10 flex flex-col items-start h-full">
                <div className="mb-6 inline-flex p-3 rounded bg-muted text-cyan-600 dark:text-cyan-400 border border-border shadow-sm dark:shadow-[0_0_10px_rgba(6,182,212,0.2)] group-hover:text-white group-hover:bg-brand-500 group-hover:border-brand-400 transition-all duration-300">
                    <Icon size={28} />
                </div>
                <h3 className="dark:scanline-effect inline-block mb-4 text-xl font-mono font-bold text-foreground dark:group-hover:text-cyan-200 group-hover:text-cyan-900  transition-colors">{t(titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-sans grow group-hover:text-foreground transition-colors">
                    {t(descKey)}
                </p>
            </div>
        </motion.div>
    );
};

export const Services = () => {
    const t = useTranslations();
    const services = [
        {
            titleKey: "service.web.title",
            descKey: "service.web.desc",
            icon: Bot
        },
        {
            titleKey: "service.mobile.title",
            descKey: "service.mobile.desc",
            icon: Share2
        },
        {
            titleKey: "service.cloud.title",
            descKey: "service.cloud.desc",
            icon: Brain
        },
        {
            titleKey: "service.ai.title",
            descKey: "service.ai.desc",
            icon: Network
        },
        {
            titleKey: "service.backend.title",
            descKey: "service.backend.desc",
            icon: Database
        },
        {
            titleKey: "service.security.title",
            descKey: "service.security.desc",
            icon: TrendingUp
        }
    ];

    return (
        <section id="services" className="py-24 bg-background relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="dark:scanline-effect inline-block font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
                        {t('services.title')} <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-brand-500">{t('services.titleHighlight')}</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-light font-sans">
                        {t('services.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, idx) => (
                        <ServiceCard key={idx} {...service} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
};
