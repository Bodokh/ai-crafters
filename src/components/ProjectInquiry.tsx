import { ArrowUpRight } from 'lucide-react';
import { ContactButton } from '@/components/SiteContactDialog';
import { localizedPath } from '@/lib/seo';
import type { LocaleKey } from '@/content/useCases';

export function ProjectInquiry({ locale, currentPath }: { locale: LocaleKey; currentPath?: string }) {
  const he = locale === 'he';
  const guides = [
    {
      path: '/resources/ai-agent-rfp-checklist',
      label: he ? 'מה כדאי לבדוק לפני שבוחרים שותף לפיתוח AI' : 'What to check before choosing an AI development partner',
    },
    {
      path: '/compare/ai-agency-vs-internal-ai-team',
      label: he ? 'שותף חיצוני או צוות פנימי?' : 'External partner or in-house team?',
    },
  ].filter(guide => guide.path !== currentPath);

  return (
    <section className="aic-card aic-editorial-panel aic-editorial-contact">
      <h2 className="aic-editorial-heading">
        {he ? 'איזה תהליך או מוצר תרצו לשפר?' : 'What would you like AI to do for your business?'}
      </h2>
      <p className="aic-editorial-copy">
        {he
          ? 'ספרו לנו על האתגר, המערכות הקיימות והתוצאה שתרצו להשיג. נבחן את הפנייה ונחזור אליכם כדי לדבר על ההתאמה והשלב הבא.'
          : 'Tell us about the challenge, your existing systems, and the result you want. We’ll review your inquiry and get back to you to discuss fit and next steps.'}
      </p>
      <ContactButton className="aic-button">
        {he ? 'נדבר על הפרויקט שלכם' : 'Discuss your project'}
        <ArrowUpRight size={19} strokeWidth={1.6} aria-hidden="true" />
      </ContactButton>
      <ul className="aic-editorial-copy space-y-2">
        {guides.map(guide => <li key={guide.path}><a className="underline underline-offset-4" href={localizedPath(locale, guide.path)}>{guide.label}</a></li>)}
      </ul>
    </section>
  );
}
