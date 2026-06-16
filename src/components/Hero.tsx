import { ArrowLeft, ArrowRight, Bot, TrendingUp, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const heroFeatures = [
  { icon: Bot, label: 'hero.feature.fast', desc: 'hero.feature.fastDesc' },
  { icon: Zap, label: 'hero.feature.secure', desc: 'hero.feature.secureDesc' },
  { icon: TrendingUp, label: 'hero.feature.global', desc: 'hero.feature.globalDesc' },
];

export const Hero = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-background pt-28 md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.12),transparent_32rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_right,rgba(100,116,139,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.16)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_top,black,transparent)] dark:bg-[linear-gradient(to_right,rgba(14,165,233,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.12)_1px,transparent_1px)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background" />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <h1 className="mx-auto max-w-5xl font-display text-5xl font-bold leading-[1.02] tracking-normal text-foreground md:text-7xl lg:text-8xl">
          <span className="block dark:scanline-effect">{t('hero.title.1')}</span>
          <span className="mt-3 block bg-gradient-to-r from-cyan-400 via-brand-500 to-violet-500 bg-clip-text pb-2 text-transparent dark:scanline-effect">
            {t('hero.title.2')}
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
          {t('hero.desc')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#contact"
            className="group inline-flex min-h-14 items-center justify-center gap-2 border border-brand-400 bg-brand-600 px-7 py-4 font-bold tracking-wider text-white shadow-[0_0_20px_rgba(14,165,233,0.28)] transition-colors hover:bg-brand-500"
          >
            {t('hero.cta.primary')} <ArrowIcon size={18} />
          </a>
          <a
            href="#services"
            className="inline-flex min-h-14 items-center justify-center border border-border bg-muted/50 px-7 py-4 font-bold tracking-wider text-foreground backdrop-blur-sm transition-colors hover:border-cyan-400 hover:text-cyan-500"
          >
            {t('hero.cta.secondary')}
          </a>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {heroFeatures.map((item) => (
            <div key={item.label} className="group relative p-6">
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-border transition-colors group-hover:border-cyan-500" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-border transition-colors group-hover:border-cyan-500" />
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full border border-border bg-muted/50 p-4 text-brand-500 shadow-[0_0_15px_rgba(14,165,233,0.08)] transition-colors group-hover:text-cyan-400">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <h2 className="mb-1 font-mono text-lg font-bold tracking-wide text-foreground dark:scanline-effect">
                  {t(item.label)}
                </h2>
                <p className="text-sm text-muted-foreground">{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
