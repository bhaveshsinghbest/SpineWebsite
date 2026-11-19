// Data loading for each page, kept separate from the page components so the components can be
// lazy-loaded (each page ships as its own JavaScript chunk).
import { forkJoin, map } from 'rxjs';
import { catchError, of } from 'rxjs';
import type { Announcement, Article, FaqGroup, JobOpening, Leader, Paged, Practice, ProjectList, Sector, SectorKind, Testimonial } from '../core/models';
import { pageResolver } from '../core/page-data';
import type { DetailData } from './collections/collections.pages';
import type { HomeData } from './home/home.page';
import type { InsightData } from './insights/insights.pages';
import type { NewsItemData } from './news/news.pages';
import type { ProjectData } from './projects/projects.pages';
import type { ServiceData } from './services/services.pages';

export { siteResolver } from '../core/page-data';

export const homeResolver = pageResolver<HomeData>((api) =>
  forkJoin({
    practices: api.practices(),
    sectors: api.sectors('sector'),
    industries: api.sectors('industry'),
    articles: api.articles(1, 3).pipe(map((r) => r.data)),
    testimonials: api.testimonials(),
    jobs: api.jobs(),
    // Optional sections: the homepage still renders if these cannot be loaded.
    projects: api.projects().pipe(map((r) => r.data.filter((x) => x.featured).slice(0, 3)), catchError(() => of([]))),
    news: api.announcements(1, 3, { homepage: true }).pipe(map((r) => r.data), catchError(() => of([] as Announcement[]))),
  }),
);

export const teamMemberResolver = pageResolver<Leader>((api, route) => api.teamMember(route.paramMap.get('slug')!));

export const servicesResolver = pageResolver<Practice[]>((api) => api.practices());
export const serviceResolver = pageResolver<ServiceData>((api, route) =>
  forkJoin({
    practice: api.practice(route.paramMap.get('slug')!),
    practices: api.practices(),
    industries: api.sectors('industry'),
    sectors: api.sectors('sector'),
  }),
);

export const sectorsIndexResolver = pageResolver<Sector[]>((api) => api.sectors('sector'));
export const pillarsIndexResolver = pageResolver<Sector[]>((api) => api.sectors('pillar'));
export const industriesIndexResolver = pageResolver<{ industries: Sector[]; sectors: Sector[] }>((api) =>
  forkJoin({ industries: api.sectors('industry'), sectors: api.sectors('sector') }),
);
export const sectorDetailResolver = pageResolver<DetailData>((api, route) => {
  const kind = route.data['kind'] as SectorKind;
  const slug = route.paramMap.get('slug')!;
  return forkJoin({ item: api.sector(kind, slug), siblings: api.sectors(kind), practices: api.practices() });
});

export const insightsResolver = pageResolver<Paged<Article>>((api, route) => {
  const page = Math.max(1, Number(route.queryParamMap.get('page')) || 1);
  return api.articles(page, 12, route.queryParamMap.get('category') ?? undefined);
});
export const insightResolver = pageResolver<InsightData>((api, route) => {
  const slug = route.paramMap.get('slug')!;
  return forkJoin({ article: api.article(slug), more: api.articles(1, 50).pipe(map((r) => r.data.filter((a) => a.slug !== slug))) });
});

export const testimonialsResolver = pageResolver<Testimonial[]>((api) => api.testimonials());
export const careersResolver = pageResolver<JobOpening[]>((api) => api.jobs());
export const faqResolver = pageResolver<FaqGroup[]>((api) => api.faqs());

export const projectsResolver = pageResolver<ProjectList>((api) => api.projects());
export const projectResolver = pageResolver<ProjectData>((api, route) => api.project(route.paramMap.get('slug')!));

export const newsResolver = pageResolver<Paged<Announcement>>((api, route) => {
  const page = Math.max(1, Number(route.queryParamMap.get('page')) || 1);
  return api.announcements(page, 12);
});
export const newsItemResolver = pageResolver<NewsItemData>((api, route) => api.announcement(route.paramMap.get('slug')!));
