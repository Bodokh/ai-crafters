import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const testimonials = [
  {
    quoteKey: 'testimonials.1.quote',
    nameKey: 'testimonials.1.name',
    roleKey: 'testimonials.1.role',
    img: '/images/testimonials/yogev-moyal.jpeg',
  },
  {
    quoteKey: 'testimonials.2.quote',
    nameKey: 'testimonials.2.name',
    roleKey: 'testimonials.2.role',
    img: '/images/testimonials/nadia-senft.jpeg',
  },
  {
    quoteKey: 'testimonials.3.quote',
    nameKey: 'testimonials.3.name',
    roleKey: 'testimonials.3.role',
    img: '/images/testimonials/nitzan_shaulof.webp',
  },
];

export const Testimonials = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <section className="border-b border-border bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl font-bold text-foreground">
            {t('testimonials.title')}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.nameKey}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-muted/40 px-10 py-8 transition-colors hover:bg-muted/60 md:px-12 lg:px-16"
            >
              <Quote
                className={`absolute top-6 text-muted-foreground ${
                  dir === 'rtl' ? 'left-6' : 'right-6'
                }`}
                size={40}
              />

              <p className="relative z-10 mb-8 leading-relaxed text-muted-foreground">
                "{t(item.quoteKey)}"
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={item.img}
                  alt={t(item.nameKey)}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-12 w-12 rounded-full border-2 border-border object-cover"
                />
                <div>
                  <h3 className="font-semibold text-foreground">{t(item.nameKey)}</h3>
                  <span className="text-sm text-brand-400">{t(item.roleKey)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
