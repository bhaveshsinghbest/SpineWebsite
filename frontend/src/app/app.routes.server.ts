import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // The admin panel runs in the browser only (it is private and needs the signed-in session).
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Public pages are rendered on the server for every request, so content edited in the admin panel
  // is live immediately and search engines receive complete HTML.
  { path: '**', renderMode: RenderMode.Server },
];
