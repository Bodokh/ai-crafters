import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ContactButton } from '@/components/SiteContactDialog';
import { LocalizedUseCase, LocaleKey, useCasesOverview } from '@/content/useCases';

type UseCaseDetailProps = {
  locale: LocaleKey;
  useCase: LocalizedUseCase;
  relatedUseCases: LocalizedUseCase[];
};

export const UseCaseDetail = ({ locale, useCase, relatedUseCases }: UseCaseDetailProps) => {
  const BackIcon = locale === 'he' ? ArrowRight : ArrowLeft;
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
    <main className="aic-page case-detail-page">
      <section className="aic-hero case-detail-hero">
        <div className="aic-container">
          <Link href="/use-cases" className="aic-text-link case-back-link">
            <BackIcon aria-hidden="true" />
            {copy.back}
          </Link>

          <div className="case-hero-layout">
            <div className="case-hero-intro">
              <div className="case-hero-labels">
                <span className="case-status">{useCase.status}</span>
                <span className="case-value-theme">{useCase.valueTheme}</span>
              </div>
              <h1 className="aic-title">{useCase.title}</h1>
              <p className="case-client">{useCase.client}</p>
              <p className="aic-lead">{useCase.eyebrow}</p>
            </div>

            <div className="aic-card case-hero-outcome">
              <p className="aic-eyebrow">{copy.outcome}</p>
              <p className="case-outcome-metric">{useCase.metric}</p>
              <p className="case-outcome-detail">{useCase.metricDetail}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="aic-container aic-section case-story">
        <div className="case-story-sections">
          <section className="case-story-section" aria-labelledby="case-problem">
            <h2 id="case-problem">{copy.sections.problem}</h2>
            <p>{useCase.problem}</p>
          </section>

          <section className="case-story-section" aria-labelledby="case-built">
            <h2 id="case-built">{copy.sections.built}</h2>
            <ul className="case-build-list">
              {useCase.built.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="case-story-section" aria-labelledby="case-impact">
            <h2 id="case-impact">{copy.sections.impact}</h2>
            <p>{useCase.impact}</p>
          </section>
        </div>

        <aside className="aic-card case-proof" aria-labelledby="case-proof-title">
          <span className="case-proof-icon"><ShieldCheck aria-hidden="true" /></span>
          <h2 id="case-proof-title">{copy.sections.proof}</h2>
          <p>{useCase.summary}</p>
          <ul>
            {useCase.proof.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ContactButton className="aic-button aic-button--secondary case-proof-cta">
            {copy.cta}
            <ArrowUpRight aria-hidden="true" />
          </ContactButton>
        </aside>
      </div>

      <section className="aic-container aic-section case-related" aria-labelledby="case-related-title">
        <div className="case-related-heading">
          <div>
            <p className="aic-eyebrow">{copy.sections.related}</p>
            <h2 id="case-related-title">{useCasesOverview.title[locale]}</h2>
          </div>
          <ContactButton className="aic-button">
            {copy.cta}
            <ArrowUpRight aria-hidden="true" />
          </ContactButton>
        </div>

        <div className="case-related-grid">
          {relatedUseCases.map((related) => (
            <Link
              key={related.slug}
              href={`/use-cases/${related.slug}`}
              className="aic-card case-related-card"
            >
              <p className="case-value-theme">{related.valueTheme}</p>
              <h3>{related.title}</h3>
              <p className="case-related-metric">{related.metric}</p>
              <div className="case-preview-link">
                <span>{copy.viewCase}</span>
                <span className="case-link-icon"><ArrowUpRight aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};
