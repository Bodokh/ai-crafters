'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Briefcase, Code, TrendingUp, Sparkles, Zap, Shield, ChevronDown, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ApplicationDialog = dynamic(
    () => import('./ApplicationDialog').then((module) => module.ApplicationDialog),
    { ssr: false }
);

interface JobCardProps {
    jobId: string;
    tags: string[];
    icon: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    onApply: (jobTitle: string) => void;
    t: any;
    reqCount: number;
    advCount: number;
}

// Decorative glyphs belong to the icon layer; keep translated labels as text.
const labelText = (label: string) => label.replace(/[\p{Extended_Pictographic}\uFE0F\u200D\u2190-\u21FF]/gu, '').trim();

const JobCard: React.FC<JobCardProps> = ({ jobId, tags, icon, isExpanded, onToggle, onApply, t, reqCount, advCount }) => {
    return (
        <article className="aic-card career-card" data-expanded={isExpanded}>
            <div className="career-card__header">
                <span className="career-card__icon" aria-hidden="true">{icon}</span>
                <div className="career-card__heading">
                    <h2>
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-expanded={isExpanded}
                            aria-controls={`job-${jobId}-details`}
                        >
                            {labelText(t(`jobs.${jobId}.title`))}
                        </button>
                    </h2>
                    <div className="career-card__tags">
                        {tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={`${labelText(t('clickToExpand'))}: ${labelText(t(`jobs.${jobId}.title`))}`}
                    aria-expanded={isExpanded}
                    aria-controls={`job-${jobId}-details`}
                    className="career-card__toggle"
                >
                    <ChevronDown size={20} aria-hidden="true" />
                </button>
            </div>

            <p className="career-card__intro">{t(`jobs.${jobId}.intro`)}</p>

            {isExpanded && (
                <div id={`job-${jobId}-details`} className="career-card__details">
                    <p>{t(`jobs.${jobId}.intro2`)}</p>
                    <div className="career-card__requirements">
                        <h3>
                            <Zap size={19} aria-hidden="true" />
                            {labelText(t(`jobs.${jobId}.requirements.title`))}
                        </h3>
                        <ul>
                            {Array.from({ length: reqCount }, (_, i) => (
                                <li key={i}>
                                    <CheckCircle2 size={18} aria-hidden="true" />
                                    <span>{t(`jobs.${jobId}.req.${i + 1}`)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="career-card__advantages">
                        <h3>
                            <Shield size={19} aria-hidden="true" />
                            {labelText(t(`jobs.${jobId}.advantages.title`))}
                        </h3>
                        <ul>
                            {Array.from({ length: advCount }, (_, i) => (
                                <li key={i}>
                                    <CheckCircle2 size={18} aria-hidden="true" />
                                    <span>{t(`jobs.${jobId}.adv.${i + 1}`)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="career-card__apply">
                        <h4>{t(`jobs.${jobId}.apply.instructions`)}</h4>
                        <p>{t(`jobs.${jobId}.apply.details`)}</p>
                        <button
                            type="button"
                            onClick={() => onApply(t(`jobs.${jobId}.title`))}
                            className="aic-button"
                        >
                            {t(`jobs.${jobId}.apply.label`)}
                            <ArrowUpRight size={19} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {!isExpanded && (
                <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`job-${jobId}-details`}
                    className="aic-text-link career-card__expand"
                    onClick={onToggle}
                >
                    {labelText(t('clickToExpand'))}
                    <ChevronDown size={17} aria-hidden="true" />
                </button>
            )}
        </article>
    );
};

export const Careers: React.FC = () => {
    const t = useTranslations('careers');
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
    const [selectedJobTitle, setSelectedJobTitle] = useState('');

    const handleApply = (jobTitle: string) => {
        setSelectedJobTitle(jobTitle);
        setApplicationDialogOpen(true);
    };

    const jobs = [
        {
            id: 'aiEngineer',
            icon: <Sparkles size={24} />,
            tags: ['Full-time', 'Remote / Hybrid', 'Senior Level'],
            reqCount: 8,
            advCount: 4,
        },
        {
            id: 'seniorDev',
            icon: <Code size={24} />,
            tags: ['Full-time', 'Remote / Hybrid', 'Senior Level'],
            reqCount: 6,
            advCount: 4,
        },
        {
            id: 'juniorDev',
            icon: <Code size={24} />,
            tags: ['Full-time', 'Hybrid', 'Junior Level'],
            reqCount: 5,
            advCount: 4,
        },
        {
            id: 'salesManager',
            icon: <TrendingUp size={24} />,
            tags: ['Full-time', 'Hybrid', 'Senior Level'],
            reqCount: 5,
            advCount: 4,
        },
    ];

    const toggleJob = (jobId: string) => {
        setExpandedJob(expandedJob === jobId ? null : jobId);
    };

    return (
        <main className="aic-page careers-page">
            <div className="aic-container">
                <header className="aic-hero careers-hero">
                    <div className="aic-eyebrow">
                        <Briefcase size={15} aria-hidden="true" />
                        <span>{t('hiring')}</span>
                    </div>
                    <h1 className="aic-title">{t('title')} {t('highlight')}</h1>
                    <p className="aic-lead">{t('subtitle')}</p>
                </header>

                {/* Jobs List */}
                <div className="careers-list">
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            jobId={job.id}
                            tags={job.tags}
                            icon={job.icon}
                            isExpanded={expandedJob === job.id}
                            onToggle={() => toggleJob(job.id)}
                            onApply={handleApply}
                            t={t}
                            reqCount={job.reqCount}
                            advCount={job.advCount}
                        />
                    ))}
                </div>
            </div>

            {/* Application Dialog */}
            {applicationDialogOpen && (
                <ApplicationDialog
                    open={applicationDialogOpen}
                    onOpenChange={setApplicationDialogOpen}
                    jobTitle={selectedJobTitle}
                />
            )}
        </main>
    );
};
