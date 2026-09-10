import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ContactButton } from '@/components/SiteContactDialog';
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
    <main className="aic-page use-cases-page">
      <section className="aic-hero use-cases-hero">
        <div className="aic-container use-cases-hero-layout">
          <div className="use-cases-intro">
            <p className="aic-eyebrow">{copy.eyebrow}</p>
            <h1 className="aic-title">{copy.title}</h1>
            <p className="aic-lead">{copy.description}</p>
            <ContactButton className="aic-button use-cases-hero-cta">
              {copy.cta}
              <ArrowUpRight aria-hidden="true" />
            </ContactButton>
          </div>

          <div className="aic-card use-cases-proof">
            <p className="use-cases-proof-heading">{copy.productionPattern}</p>
            <ul>
              {copy.proofPoints.map((point) => (
                <li key={point}>
                  <CheckCircle2 aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="aic-container aic-section use-cases-collection" aria-label={copy.eyebrow}>
        <div className="use-cases-grid">
          {useCases.map((useCase) => (
            <Link
              key={useCase.slug}
              href={`/use-cases/${useCase.slug}`}
              className="aic-card case-preview"
            >
              <div className="case-preview-intro">
                <span className="case-status">{useCase.status}</span>
                <p className="case-value-theme">{useCase.valueTheme}</p>
                <h2>{useCase.title}</h2>
                <p className="case-client">{useCase.client}</p>
              </div>

              <div className="case-preview-outcome">
                <p className="case-preview-metric">{useCase.metric}</p>
                <p className="case-preview-summary">{useCase.summary}</p>
              </div>

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
