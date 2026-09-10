import { useLocale } from 'next-intl';
import { faqs } from '@/content/site';
import type { LocaleKey } from '@/content/useCases';

export const FAQ = () => {
  const locale = useLocale() as LocaleKey;

  return (
    <section id="faq" className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {locale === 'he' ? 'מה כדאי לדעת לפני שמתחילים פרויקט AI?' : 'What should you know before starting an AI project?'}
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {locale === 'he'
              ? 'תשובות על פתרונות AI מותאמים אישית, חיבור למערכות קיימות ואיך מתחילים לעבוד יחד.'
              : 'Answers about custom AI solutions, working with your existing systems and getting started with AI Crafters.'}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5">
          {faqs.map((faq) => (
            <article key={faq.question.en} className="border border-border bg-card p-6 md:p-8">
              <h3 className="font-display text-2xl font-bold text-foreground">
                {faq.question[locale]}
              </h3>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {faq.answer[locale]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
