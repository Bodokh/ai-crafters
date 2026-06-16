import { Bot, Brain, Database, Network, Share2, TrendingUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { servicePages } from '@/content/site';
import type { LocaleKey } from '@/content/useCases';
import { Link } from '@/i18n/routing';

const serviceIcons = {
  'ai-agent-development': Bot,
  'workflow-automation': Share2,
  'enterprise-ai-agents': Network,
  'ai-business-intelligence': Brain,
  'custom-ai-integration': Database,
  'knowledge-base-ai': TrendingUp,
} as const;

export const Services = () => {
  const t = useTranslations();
  const locale = useLocale() as LocaleKey;

  return (
    <section id="services" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="inline-block font-display text-4xl font-bold text-foreground dark:scanline-effect md:text-5xl">
            {t('services.title')}{' '}
            <span className="bg-linear-to-r from-cyan-400 to-brand-500 bg-clip-text text-transparent">
              {t('services.titleHighlight')}
            </span>
          </h2>
          <p className="mt-6 text-lg font-light text-muted-foreground">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicePages.map((service) => {
            const Icon = serviceIcons[service.slug as keyof typeof serviceIcons] ?? Bot;

            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative flex h-full flex-col overflow-hidden border border-border bg-card p-8 transition-all duration-300 hover:border-brand-500/50 hover:shadow-lg dark:hover:shadow-none"
              >
                <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-border transition-colors group-hover:border-cyan-400" />
                <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-border transition-colors group-hover:border-cyan-400" />
                <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-border transition-colors group-hover:border-cyan-400" />
                <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-border transition-colors group-hover:border-cyan-400" />

                <div className="mb-6 inline-flex w-fit border border-border bg-muted p-3 text-cyan-600 shadow-sm transition-colors group-hover:border-brand-400 group-hover:bg-brand-500 group-hover:text-white dark:text-cyan-400 dark:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Icon size={28} />
                </div>
                <h3 className="mb-4 font-mono text-xl font-bold text-foreground transition-colors group-hover:text-cyan-900 dark:scanline-effect dark:group-hover:text-cyan-200">
                  {service.title[locale]}
                </h3>
                <p className="grow text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                  {service.description[locale]}
                </p>
                <span className="mt-6 font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
                  {locale === 'he' ? 'קראו עוד' : 'Read more'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
