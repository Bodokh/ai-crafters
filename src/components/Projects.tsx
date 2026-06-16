import { Code2, Cpu, Database, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

const projects = [
  {
    titleKey: 'project.1.title',
    descKey: 'project.1.desc',
    tagKey: 'project.1.tag',
    icon: Code2,
    techs: ['RabbitMQ', 'GKE', 'ElasticSearch'],
    status: 'Active',
    externalLink: 'https://colors-ai.com',
  },
  {
    titleKey: 'project.2.title',
    descKey: 'project.2.desc',
    tagKey: 'project.2.tag',
    icon: Database,
    techs: ['GKE', 'Faiss', 'LangGraph'],
    status: 'Deployed',
    externalLink: 'https://app.roadprotect.co.il',
  },
  {
    titleKey: 'project.3.title',
    descKey: 'project.3.desc',
    tagKey: 'project.3.tag',
    icon: Cpu,
    techs: ['Qlik', 'LangGraph', 'ElasticSearch'],
    status: 'In Beta',
  },
];

export const Projects = () => {
  const t = useTranslations();

  return (
    <section id="work" className="relative border-t border-border bg-background py-24">
      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="inline-block font-display text-4xl font-bold text-foreground dark:scanline-effect md:text-5xl">
            {t('projects.title')}{' '}
            <span className="bg-linear-to-r from-cyan-400 to-brand-500 bg-clip-text text-transparent">
              {t('projects.titleHighlight')}
            </span>
          </h2>
          <p className="mt-6 text-lg font-light text-muted-foreground">
            {t('projects.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.titleKey}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg dark:hover:shadow-none"
            >
              <div className="h-2 bg-linear-to-r from-cyan-500 via-brand-500 to-violet-500 opacity-70" />

              <div className="p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div className="rounded-lg bg-muted p-3 text-cyan-600 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:text-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <project.icon size={24} />
                  </div>
                  <span className="rounded border border-border bg-muted px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {project.status}
                  </span>
                </div>

                <h3 className="mb-3 font-display text-xl font-bold text-foreground dark:scanline-effect">
                  {t(project.titleKey)}
                </h3>
                <p className="mb-6 min-h-20 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                  {t(project.descKey)}
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {project.techs.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors group-hover:border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-500">
                    {t(project.tagKey)}
                  </span>
                  {project.externalLink && (
                    <a
                      href={project.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={t(project.titleKey)}
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
