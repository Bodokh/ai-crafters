'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  FEATURED_USE_CASE_LIMIT,
  getFeaturedUseCases,
  getUseCases,
  LocaleKey,
  useCasesOverview,
} from '@/content/useCases';

export const FeaturedUseCases = () => {
  const locale = useLocale() as LocaleKey;
  const [expanded, setExpanded] = useState(false);
  const featured = useMemo(() => getFeaturedUseCases(locale), [locale]);
  const allUseCases = useMemo(() => getUseCases(locale), [locale]);
  const visibleUseCases = expanded ? allUseCases : featured;
  const canExpand = allUseCases.length > FEATURED_USE_CASE_LIMIT;
  const copy = {
    title: useCasesOverview.homepage.title[locale],
    titleHighlight: useCasesOverview.homepage.titleHighlight[locale],
    subtitle: useCasesOverview.homepage.subtitle[locale],
    showMore: useCasesOverview.homepage.showMore[locale],
    showLess: useCasesOverview.homepage.showLess[locale],
    viewCase: useCasesOverview.viewCase[locale],
  };

  return (
    <section id="work" className="relative border-t border-border bg-background py-24">
      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="inline-block font-display text-4xl font-bold text-foreground dark:scanline-effect md:text-5xl">
            {copy.title}{' '}
            <span className="bg-linear-to-r from-cyan-400 to-brand-500 bg-clip-text text-transparent">
              {copy.titleHighlight}
            </span>
          </h2>
          <p className="mt-6 text-lg font-light text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleUseCases.map((useCase, index) => (
            <Link
              key={useCase.slug}
              href={`/use-cases/${useCase.slug}`}
              className="group relative flex min-h-[390px] flex-col border border-border bg-card p-6 md:p-7 transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-500 via-brand-500 to-violet-500 opacity-70" />
              <div className="flex items-start justify-between gap-4">
                <span className="border border-border bg-muted px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {useCase.status}
                </span>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-300">
                  0{index + 1}
                </span>
              </div>

              <div className="mt-8">
                <p className="text-xs font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  {useCase.valueTheme}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-foreground">
                  {useCase.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {useCase.client}
                </p>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <p className="font-display text-3xl font-bold text-foreground">
                  {useCase.metric}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {useCase.summary}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                <span className="text-xs font-mono uppercase tracking-widest text-foreground">
                  {copy.viewCase}
                </span>
                <ArrowUpRight className="h-5 w-5 text-cyan-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          ))}
        </div>

        {canExpand && (
          <div className="mt-12 text-center">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((isExpanded) => !isExpanded)}
              className="inline-flex min-h-11 items-center justify-center border border-cyan-500/50 bg-cyan-900/5 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 transition-all hover:border-cyan-400 hover:bg-cyan-500 hover:text-white dark:bg-cyan-900/20 dark:text-cyan-400"
            >
              {expanded ? copy.showLess : copy.showMore}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
