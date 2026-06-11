import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LocalizedUseCase, LocaleKey, useCasesOverview } from '@/content/useCases';

type UseCasesOverviewProps = {
  locale: LocaleKey;
  useCases: LocalizedUseCase[];
};

export const UseCasesOverview = ({ locale, useCases }: UseCasesOverviewProps) => {
  const copy = {
    title: useCasesOverview.title[locale],
    eyebrow: useCasesOverview.eyebrow[locale],
    description: useCasesOverview.description[locale],
    proofPoints: useCasesOverview.proofPoints[locale],
    viewCase: useCasesOverview.viewCase[locale],
    cta: useCasesOverview.cta[locale],
    productionPattern: useCasesOverview.productionPattern[locale],
  };

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-24">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-end">
            <div>
              <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                {copy.eyebrow}
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-normal text-foreground max-w-4xl">
                {copy.title}
              </h1>
              <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-muted-foreground">
                {copy.description}
              </p>
            </div>

            <div className="border border-border bg-card p-6 md:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-6">
                {copy.productionPattern}
              </p>
              <div className="space-y-4">
                {copy.proofPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
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
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-foreground">
                  {useCase.title}
                </h2>
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
      </section>
    </main>
  );
};
