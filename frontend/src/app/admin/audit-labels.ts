// Human-readable names for audit-log actions and modules.
const ACTIONS: Record<string, string> = {
  create: 'Created', update: 'Edited', delete: 'Deleted', publish: 'Published', unpublish: 'Unpublished', archive: 'Archived', close: 'Closed',
  upload: 'Uploaded', download: 'Downloaded', export: 'Exported', login: 'Signed in', logout: 'Signed out', login_failed: 'Failed sign-in',
  session_expired: 'Session expired', password_reset_requested: 'Password reset requested', password_reset: 'Password reset',
};
const MODULES: Record<string, string> = {
  auth: 'Authentication', session: 'Authentication', password: 'Authentication', practices: 'Services', sectors: 'Industries & Sectors', team: 'Team', clients: 'Clients',
  associates: 'Associates', offices: 'Offices', articles: 'Insights', jobs: 'Career Management', applications: 'Career Management', enquiries: 'Enquiry Management',
  testimonials: 'Testimonials', redirects: 'Redirects', content: 'Website Content', media: 'Media library', projects: 'Project Management',
  'project-categories': 'Project categories', announcements: 'Announcements & News', users: 'Users',
};

export const auditAction = (a: string) => ACTIONS[a] ?? a.replace(/_/g, ' ');
export const auditModule = (m: string) => MODULES[m] ?? m;
