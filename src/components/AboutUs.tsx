'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Shield, TrendingUp, Rocket, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

const FounderCard = ({ nameKey, imageSrc, linkedinUrl }: { nameKey: string, imageSrc: string, linkedinUrl: string }) => {
  const t = useTranslations(`about.${nameKey}`);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center group hover:border-brand-500/50"
    >
      <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-background shadow-xl group-hover:border-brand-500 transition-colors">
        <Image
          src={imageSrc}
          alt={t('name')}
          fill
          loading="lazy"
          className="object-cover"
        />
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-1">{t('name')}</h3>
      <p className="text-cyan-600 dark:text-cyan-400 font-medium mb-4">{t('title')}</p>
      
      <a 
        href={linkedinUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-500 transition-colors mb-8 text-sm"
      >
        <Linkedin size={16} />
        <span>LinkedIn Profile</span>
      </a>

      <div className="space-y-4 w-full">
        <div className="flex gap-3 items-start">
          <div className="mt-1 text-cyan-500 shrink-0">
            <Shield size={20} />
          </div>
          <p className="text-muted-foreground text-sm">{t('desc1')}</p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-1 text-cyan-500 shrink-0">
            <TrendingUp size={20} />
          </div>
          <p className="text-muted-foreground text-sm">{t('desc2')}</p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-1 text-cyan-500 shrink-0">
            <Rocket size={20} />
          </div>
          <p className="text-muted-foreground text-sm">{t('desc3')}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const AboutUs = () => {
  const t = useTranslations('about');

  const founders = [
    {
      key: 'saar',
      image: '/images/testimonials/saar-litmanovitz.jpeg',
      linkedin: 'https://www.linkedin.com/in/saar-litmanovich/',
    },
    {
      key: 'eran',
      image: '/images/team/eran.png', // Placeholder path - user needs to add file
      linkedin: 'https://www.linkedin.com/in/eran-bodokh/', 
    },
    {
      key: 'dvir',
      image: '/images/team/dvir.png', // Placeholder path - user needs to add file
      linkedin: 'https://www.linkedin.com/in/dvircohen1/',
    }
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="inline-block font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {founders.map((founder) => (
            <FounderCard 
              key={founder.key}
              nameKey={founder.key}
              imageSrc={founder.image}
              linkedinUrl={founder.linkedin}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

