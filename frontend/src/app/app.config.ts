import { LocationStrategy, ViewportScroller } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { adminApiInterceptor } from './core/interceptors';
import { TrailingSlashLocationStrategy } from './core/trailing-slash.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    { provide: LocationStrategy, useClass: TrailingSlashLocationStrategy },
    provideHttpClient(withFetch(), withInterceptors([adminApiInterceptor])),
    // Data fetched during server rendering is reused by the browser instead of being requested again.
    provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: false })),
    // Anchor links land below the fixed header (5rem high).
    provideAppInitializer(() => inject(ViewportScroller).setOffset([0, 84])),
  ],
};
