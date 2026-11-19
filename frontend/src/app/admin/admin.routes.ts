import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth.service';
import type { ModuleTab } from './modules.pages';

const list = () => import('./resource-list.page').then((m) => m.ResourceListPage);
const edit = () => import('./resource-edit.page').then((m) => m.ResourceEditPage);
const shell = () => import('./modules.pages').then((m) => m.ModuleShellComponent);
const content = () => import('./content.page').then((m) => m.AdminContentPage);
const submissions = () => import('./submissions.pages').then((m) => m.SubmissionListPage);
const submission = () => import('./submissions.pages').then((m) => m.SubmissionDetailPage);

const careerTabs: ModuleTab[] = [
  { label: 'Job openings', path: '/admin/careers/openings', icon: 'work' },
  { label: 'Applications', path: '/admin/careers/applications', icon: 'badge' },
  { label: 'Settings', path: '/admin/careers/settings', icon: 'tune' },
];
const projectTabs: ModuleTab[] = [
  { label: 'Projects', path: '/admin/projects', icon: 'apartment', exact: true },
  { label: 'Categories', path: '/admin/projects/categories', icon: 'category' },
];
const contentTabs: ModuleTab[] = [
  { label: 'Overview', path: '/admin/content', icon: 'apps', exact: true },
  { label: 'Homepage', path: '/admin/content/home', icon: 'home' },
  { label: 'Page headings', path: '/admin/content/pages', icon: 'title' },
  { label: 'Services', path: '/admin/content/r/practices', icon: 'handshake' },
  { label: 'Industries & sectors', path: '/admin/content/r/sectors', icon: 'factory' },
  { label: 'About Us', path: '/admin/content/blocks/overview', icon: 'domain' },
  { label: 'Media library', path: '/admin/content/media', icon: 'photo_library' },
];
const settingsTabs: ModuleTab[] = [
  { label: 'Company & social', path: '/admin/settings', icon: 'business', exact: true },
  { label: 'Footer', path: '/admin/settings/footer', icon: 'call_to_action' },
  { label: 'Offices & addresses', path: '/admin/settings/offices', icon: 'location_on' },
];

// The admin panel is a separate lazy-loaded area, rendered in the browser only (see app.routes.server.ts).
// Every page below the layout requires the administrator's session (authGuard); the API checks it again.
export const ADMIN_ROUTES: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./login.page').then((m) => m.AdminLoginPage) },
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./password-reset.pages').then((m) => m.ForgotPasswordPage) },
  { path: 'reset-password', loadComponent: () => import('./password-reset.pages').then((m) => m.ResetPasswordPage) },
  {
    path: '',
    loadComponent: () => import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./dashboard.page').then((m) => m.AdminDashboardPage) },

      // 2. Career Management
      {
        path: 'careers', loadComponent: shell, data: { title: 'Career Management', subtitle: 'Job openings and applications', tabs: careerTabs },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'openings' },
          { path: 'openings', loadComponent: list, data: { permission: 'jobs', resource: 'jobs', base: '/admin/careers/openings', embedded: true } },
          { path: 'openings/:id', loadComponent: edit, data: { permission: 'jobs', resource: 'jobs', base: '/admin/careers/openings', backLabel: 'Job openings' } },
          { path: 'applications', loadComponent: submissions, data: { permission: 'applications', type: 'applications', embedded: true } },
          { path: 'applications/:id', loadComponent: submission, data: { permission: 'applications', type: 'applications' } },
          { path: 'settings', loadComponent: content, data: { permission: 'jobs', key: 'careerOptions', embedded: true } },
        ],
      },

      // 3. Enquiry Management
      { path: 'enquiries', loadComponent: submissions, data: { permission: 'enquiries', type: 'enquiries' } },
      { path: 'enquiries/:id', loadComponent: submission, data: { permission: 'enquiries', type: 'enquiries' } },

      // 4. Project Management
      {
        path: 'projects', loadComponent: shell, data: { title: 'Project Management', subtitle: 'Projects and project details', tabs: projectTabs },
        children: [
          { path: '', loadComponent: list, data: { permission: 'projects', resource: 'projects', base: '/admin/projects', embedded: true } },
          { path: 'categories', loadComponent: list, data: { permission: 'projects', resource: 'project-categories', base: '/admin/projects/categories', embedded: true } },
          { path: 'categories/:id', loadComponent: edit, data: { permission: 'projects', resource: 'project-categories', base: '/admin/projects/categories', backLabel: 'Categories' } },
          { path: ':id', loadComponent: edit, data: { permission: 'projects', resource: 'projects', base: '/admin/projects', backLabel: 'Projects' } },
        ],
      },

      // 5. Announcements & News
      { path: 'announcements', loadComponent: list, data: { permission: 'announcements', resource: 'announcements', base: '/admin/announcements' } },
      { path: 'announcements/:id', loadComponent: edit, data: { permission: 'announcements', resource: 'announcements', base: '/admin/announcements' } },

      // 6. Website Content Management
      {
        path: 'content', loadComponent: shell, data: { title: 'Website Content Management', subtitle: 'Homepage, About Us, services and banners — published changes appear on the website immediately.', tabs: contentTabs },
        children: [
          { path: '', loadComponent: () => import('./modules.pages').then((m) => m.CmsOverviewPage) },
          { path: 'home', loadComponent: content, data: { permission: 'content', key: 'home', embedded: true } },
          { path: 'pages', loadComponent: content, data: { permission: 'content', key: 'pages', embedded: true } },
          { path: 'blocks/:key', loadComponent: content, data: { permission: 'content', embedded: true } },
          { path: 'media', loadComponent: () => import('./settings.pages').then((m) => m.AdminMediaPage), data: { permission: 'media', embedded: true } },
          { path: 'r/:resource', loadComponent: list, data: { permission: 'content', embedded: true } },
          { path: 'r/:resource/:id', loadComponent: edit, data: { permission: 'content' } },
        ],
      },

      // 7. Audit Log (read-only)
      { path: 'activity', loadComponent: () => import('./settings.pages').then((m) => m.AdminActivityPage), data: { permission: 'activity' } },

      // 8. Website Settings
      {
        path: 'settings', loadComponent: shell, data: { title: 'Website Settings', subtitle: 'Company information, logo, contact details, social links and footer — reflected across the website.', tabs: settingsTabs },
        children: [
          { path: '', loadComponent: content, data: { permission: 'settings', key: 'company', embedded: true } },
          { path: 'footer', loadComponent: content, data: { permission: 'settings', key: 'footer', embedded: true } },
          { path: 'offices', loadComponent: list, data: { permission: 'settings', resource: 'offices', base: '/admin/settings/offices', embedded: true } },
          { path: 'offices/:id', loadComponent: edit, data: { permission: 'settings', resource: 'offices', base: '/admin/settings/offices', backLabel: 'Offices & addresses' } },
        ],
      },

      { path: 'account', loadComponent: () => import('./settings.pages').then((m) => m.AdminAccountPage) },

      // Earlier admin URLs.
      { path: 'r/jobs', redirectTo: 'careers/openings' },
      { path: 'r/:resource', redirectTo: 'content/r/:resource' },
      { path: 'applications', redirectTo: 'careers/applications' },
      { path: 'applications/:id', redirectTo: 'careers/applications/:id' },
      { path: 'media', redirectTo: 'content/media' },
      { path: '**', redirectTo: '' },
    ],
  },
];
