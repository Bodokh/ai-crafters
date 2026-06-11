import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LocalizedUseCase, LocaleKey, useCasesOverview } from '@/content/useCases';

type UseCaseDetailProps = {
  locale: LocaleKey;
  useCase: LocalizedUseCase;
  relatedUseCases: LocalizedUseCase[];
};

export const UseCaseDetail = ({ locale, useCase, relatedUseCases }: UseCaseDetailProps) => {
  const isRtl = locale === 'he';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const copy = {
    back: useCasesOverview.backToUseCases[locale],
    cta: useCasesOverview.cta[locale],
    viewCase: useCasesOverview.viewCase[locale],
    outcome: useCasesOverview.outcome[locale],
    sections: {
      problem: useCasesOverview.sections.problem[locale],
      built: useCasesOverview.sections.built[locale],
      impact: useCasesOverview.sections.impact[locale],
      proof: useCasesOverview.sections.proof[locale],
      related: useCasesOverview.sections.related[locale],
    },
  };

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-24">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">
          <Link
            href="/use-cases"
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground transition-colors hover:text-cyan-500"
          >
            <BackIcon className="h-4 w-4" />
            {copy.back}
          </Link>

          <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
                  {useCase.status}
                </span>
                <span className="border border-border bg-muted px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {useCase.valueTheme}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-foreground">
                {useCase.title}
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground">
                {useCase.client}
              </p>
              <p className="mt-8 max-w-3xl text-xl md:text-2xl leading-9 text-foreground">
                {useCase.eyebrow}
              </p>
            </div>

            <div className="border border-border bg-card p-7 md:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {copy.outcome}
              </p>
              <p className="mt-5 font-display text-4xl md:text-5xl font-bold leading-tight text-foreground">
                {useCase.metric}
              </p>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                {useCase.metricDetail}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-3 gap-6">
          <article className="border border-border bg-card p-7 md:p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
              {copy.sections.problem}
            </p>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              {useCase.problem}
            </p>
          </article>

          <article className="border border-border bg-card p-7 md:p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
              {copy.sections.built}
            </p>
            <ul className="mt-6 space-y-4">
              {useCase.built.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="border border-border bg-card p-7 md:p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
              {copy.sections.impact}
            </p>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              {useCase.impact}
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-cyan-500/40 bg-cyan-500/10 text-cyan-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  {copy.sections.proof}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {useCase.summary}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 lg:max-w-3xl">
              {useCase.proof.map((item) => (
                <div key={item} className="border border-border bg-card px-4 py-3 text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
              {copy.sections.related}
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-foreground">
              {useCasesOverview.title[locale]}
            </h2>
          </div>
          <Link
            href="/#contact"
            className="inline-flex w-fit items-center gap-2 border border-cyan-500/60 px-5 py-3 text-xs font-mono uppercase tracking-widest text-cyan-600 transition-colors hover:bg-cyan-500 hover:text-white dark:text-cyan-300"
          >
            {copy.cta}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {relatedUseCases.map((related) => (
            <Link
              key={related.slug}
              href={`/use-cases/${related.slug}`}
              className="group border border-border bg-card p-6 transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {related.valueTheme}
              </p>
              <h3 className="mt-4 font-display text-xl font-bold leading-tight text-foreground">
                {related.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {related.metric}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs font-mono uppercase tracking-widest text-foreground">
                  {copy.viewCase}
                </span>
                <ArrowUpRight className="h-4 w-4 text-cyan-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};
