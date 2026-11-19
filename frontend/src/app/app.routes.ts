import type { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout.component';
import * as r from './pages/resolvers';

// Page URLs are unchanged from the original website (the trailing "/" is added by TrailingSlashLocationStrategy).
// Every page is lazy-loaded; data is resolved before rendering so pages are complete when server-rendered.
export const routes: Routes = [
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
  {
    path: '',
    component: PublicLayoutComponent,
    resolve: { page: r.siteResolver },
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage), resolve: { page: r.homeResolver } },

      { path: 'about', loadComponent: () => import('./pages/about/about.pages').then((m) => m.AboutOverviewPage), resolve: { page: r.siteResolver } },
      { path: 'about/mission', loadComponent: () => import('./pages/about/about.pages').then((m) => m.AboutMissionPage), resolve: { page: r.siteResolver } },
      { path: 'about/vision', loadComponent: () => import('./pages/about/about.pages').then((m) => m.AboutVisionPage), resolve: { page: r.siteResolver } },
      { path: 'about/team', loadComponent: () => import('./pages/about/about.pages').then((m) => m.AboutTeamPage), resolve: { page: r.siteResolver } },
      { path: 'about/team/:slug', loadComponent: () => import('./pages/about/about.pages').then((m) => m.TeamMemberPage), resolve: { page: r.teamMemberResolver } },

      { path: 'services', loadComponent: () => import('./pages/services/services.pages').then((m) => m.ServicesPage), resolve: { page: r.servicesResolver } },
      { path: 'services/:slug', loadComponent: () => import('./pages/services/services.pages').then((m) => m.ServicePage), resolve: { page: r.serviceResolver } },

      { path: 'industries', loadComponent: () => import('./pages/collections/collections.pages').then((m) => m.IndustriesPage), resolve: { page: r.industriesIndexResolver } },
      { path: 'industries/:slug', loadComponent: () => import('./pages/collections/collections.pages').then((m) => m.SectorDetailPage), resolve: { page: r.sectorDetailResolver }, data: { kind: 'industry' } },
      { path: 'sectors', loadComponent: () => import('./pages/collections/collections.pages').then((m) => m.SectorsPage), resolve: { page: r.sectorsIndexResolver } },
      { path: 'sectors/:slug', loadComponent: () => import('./pages/collections/collections.pages').then((m) => m.SectorDetailPage), resolve: { page: r.sectorDetailResolver }, data: { kind: 'sector' } },
      { path: 'strategic-pillars', loadComponent: () => import('./pages/collections/collections.pages').then((m) => m.PillarsPage), resolve: { page: r.pillarsIndexResolver } },
      { path: 'strategic-pillars/:slug', loadComponent: () => import('./pages/collections/collections.pages').then((m) => m.SectorDetailPage), resolve: { page: r.sectorDetailResolver }, data: { kind: 'pillar' } },

      { path: 'projects', loadComponent: () => import('./pages/projects/projects.pages').then((m) => m.ProjectsPage), resolve: { page: r.projectsResolver } },
      { path: 'projects/:slug', loadComponent: () => import('./pages/projects/projects.pages').then((m) => m.ProjectPage), resolve: { page: r.projectResolver } },
      { path: 'news', loadComponent: () => import('./pages/news/news.pages').then((m) => m.NewsPage), resolve: { page: r.newsResolver }, runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'news/:slug', loadComponent: () => import('./pages/news/news.pages').then((m) => m.NewsItemPage), resolve: { page: r.newsItemResolver } },

      { path: 'insights', loadComponent: () => import('./pages/insights/insights.pages').then((m) => m.InsightsPage), resolve: { page: r.insightsResolver }, runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'insights/:slug', loadComponent: () => import('./pages/insights/insights.pages').then((m) => m.InsightPage), resolve: { page: r.insightResolver } },

      { path: 'clientele', loadComponent: () => import('./pages/company/company.pages').then((m) => m.ClientelePage), resolve: { page: r.siteResolver } },
      { path: 'association', loadComponent: () => import('./pages/company/company.pages').then((m) => m.AssociationPage), resolve: { page: r.siteResolver } },
      { path: 'testimonials', loadComponent: () => import('./pages/company/company.pages').then((m) => m.TestimonialsPage), resolve: { page: r.testimonialsResolver } },
      { path: 'contact', loadComponent: () => import('./pages/company/company.pages').then((m) => m.ContactPage), resolve: { page: r.siteResolver } },
      { path: 'careers', loadComponent: () => import('./pages/careers/careers.page').then((m) => m.CareersPage), resolve: { page: r.careersResolver } },

      { path: 'faq', loadComponent: () => import('./pages/misc/misc.pages').then((m) => m.FaqPage), resolve: { page: r.faqResolver } },
      { path: 'privacy', loadComponent: () => import('./pages/misc/misc.pages').then((m) => m.PrivacyPage), resolve: { page: r.siteResolver } },
      { path: 'disclaimer', loadComponent: () => import('./pages/misc/misc.pages').then((m) => m.DisclaimerPage), resolve: { page: r.siteResolver } },

      { path: '**', loadComponent: () => import('./pages/misc/misc.pages').then((m) => m.NotFoundPage) },
    ],
  },
];
