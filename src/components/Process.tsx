import { Cpu, Map, Rocket, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const steps = [
  {
    icon: Search,
    titleKey: 'process.1.title',
    descKey: 'process.1.desc',
  },
  {
    icon: Map,
    titleKey: 'process.2.title',
    descKey: 'process.2.desc',
  },
  {
    icon: Cpu,
    titleKey: 'process.3.title',
    descKey: 'process.3.desc',
  },
  {
    icon: Rocket,
    titleKey: 'process.4.title',
    descKey: 'process.4.desc',
  },
];

export const Process = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <section id="process" className="relative overflow-hidden bg-background py-16">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="inline-block font-display text-4xl font-bold tracking-tight text-foreground dark:scanline-effect md:text-5xl">
            {t('process.title')}
          </h2>
          <div className="mx-auto my-4 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-brand-500" />
          <p className="mx-auto max-w-2xl font-light text-muted-foreground">
            {t('process.subtitle')}
          </p>
        </div>

        <div className="space-y-6 md:hidden">
          {steps.map((step, index) => (
            <article
              key={step.titleKey}
              className="rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-1 transition-all duration-300 hover:from-cyan-500/50 hover:to-brand-500/50"
            >
              <div className="relative h-full overflow-hidden rounded-xl bg-background p-6 text-start">
                <div
                  className={`absolute top-0 p-3 font-mono text-7xl font-bold text-muted-foreground opacity-10 pointer-events-none ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  }`}
                >
                  0{index + 1}
                </div>
                <div className="relative z-10 mb-3 flex items-center gap-3">
                  <div className="rounded-lg border border-border bg-muted p-2.5 text-cyan-400 transition-colors">
                    <step.icon size={20} />
                  </div>
                  <h3 className="font-mono text-lg font-bold text-foreground dark:scanline-effect">
                    {t(step.titleKey)}
                  </h3>
                </div>
                <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto hidden max-w-5xl grid-cols-2 gap-x-8 gap-y-4 md:grid">
          {steps.map((step, index) => (
            <article
              key={step.titleKey}
              className={`rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-1 transition-all duration-300 hover:from-cyan-500/50 hover:to-brand-500/50 ${
                index % 2 === 0 ? 'mt-0' : 'mt-12'
              }`}
            >
              <div className="relative h-full overflow-hidden rounded-xl bg-background p-6 text-start">
                <div
                  className={`absolute top-0 p-3 font-mono text-8xl font-bold text-muted-foreground opacity-10 pointer-events-none ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  }`}
                >
                  0{index + 1}
                </div>
                <div className="relative z-10 mb-3 flex items-center gap-3">
                  <div className="rounded-lg border border-border bg-muted p-2.5 text-cyan-400 transition-colors">
                    <step.icon size={22} />
                  </div>
                  <h3 className="font-mono text-lg font-bold text-foreground dark:scanline-effect">
                    {t(step.titleKey)}
                  </h3>
                </div>
                <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
