import Image from 'next/image';
import { Linkedin, Rocket, Shield, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

type FounderCardProps = {
  nameKey: string;
  imageSrc: string;
  linkedinUrl: string;
};

const FounderCard = ({ nameKey, imageSrc, linkedinUrl }: FounderCardProps) => {
  const t = useTranslations(`about.${nameKey}`);

  return (
    <article className="group flex flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-brand-500/50 hover:shadow-md">
      <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-xl transition-colors group-hover:border-brand-500">
        <Image
          src={imageSrc}
          alt={t('name')}
          fill
          sizes="128px"
          loading="lazy"
          className="object-cover"
        />
      </div>

      <h3 className="mb-1 text-2xl font-bold text-foreground">{t('name')}</h3>
      <p className="mb-4 font-medium text-cyan-600 dark:text-cyan-400">{t('title')}</p>

      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-brand-500"
      >
        <Linkedin size={16} />
        <span>LinkedIn Profile</span>
      </a>

      <div className="w-full space-y-4">
        {[
          { icon: Shield, text: t('desc1') },
          { icon: TrendingUp, text: t('desc2') },
          { icon: Rocket, text: t('desc3') },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-3">
            <div className="mt-1 shrink-0 text-cyan-500">
              <item.icon size={20} />
            </div>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </article>
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
      image: '/images/team/eran.png',
      linkedin: 'https://www.linkedin.com/in/eran-bodokh/',
    },
    {
      key: 'dvir',
      image: '/images/team/dvir.png',
      linkedin: 'https://www.linkedin.com/in/dvircohen1/',
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="inline-block font-display text-4xl font-bold text-foreground md:text-5xl">
            {t('title')}
          </h2>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
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
