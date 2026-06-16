import type { MetadataRoute } from 'next';
import { comparisonPages, resourcePages, servicePages } from '@/content/site';
import { useCaseSlugs } from '@/content/useCases';
import { localizedUrl } from '@/lib/seo';

const now = new Date();

const localizedEntries = (
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly'
) =>
  (['en', 'he'] as const).map((locale) => ({
    url: localizedUrl(locale, path),
    lastModified: now,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: localizedUrl('en', path),
        he: localizedUrl('he', path),
      },
    },
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...localizedEntries('/', 1, 'weekly'),
    ...localizedEntries('/careers', 0.5, 'monthly'),
    ...localizedEntries('/use-cases', 0.9, 'weekly'),
    ...useCaseSlugs.flatMap((slug) =>
      localizedEntries(`/use-cases/${slug}`, 0.85, 'monthly')
    ),
    ...servicePages.flatMap((service) =>
      localizedEntries(`/services/${service.slug}`, 0.9, 'monthly')
    ),
    ...comparisonPages.flatMap((page) =>
      localizedEntries(`/compare/${page.slug}`, 0.75, 'monthly')
    ),
    ...resourcePages.flatMap((page) =>
      localizedEntries(`/resources/${page.slug}`, 0.75, 'monthly')
    ),
  ];
}
