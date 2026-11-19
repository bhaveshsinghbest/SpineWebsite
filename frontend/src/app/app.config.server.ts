import { FetchBackend, HttpBackend, type HttpEvent, type HttpRequest } from '@angular/common/http';
import { Injectable, inject, mergeApplicationConfig, type ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import type { Observable } from 'rxjs';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * During server rendering, API calls go straight to the backend (API_INTERNAL_URL) instead of out
 * through the public domain. Done in the HTTP backend — after every interceptor, including the
 * transfer cache — so the cache keys stay the relative URLs that the browser later requests.
 */
@Injectable()
class InternalApiBackend implements HttpBackend {
  private fetch = inject(FetchBackend);
  private base = (process.env['API_INTERNAL_URL'] ?? '').replace(/\/$/, '');

  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    if (this.base) {
      const match = req.url.match(/^(?:https?:\/\/[^/]+)?(\/(?:api|uploads)\/.*)$/);
      if (match) return this.fetch.handle(req.clone({ url: this.base + match[1] }));
    }
    return this.fetch.handle(req);
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    InternalApiBackend,
    { provide: HttpBackend, useExisting: InternalApiBackend },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
