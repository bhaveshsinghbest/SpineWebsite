import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable, catchError, combineLatest, map, of } from 'rxjs';
import { ApiService } from './api.service';
import type { Site } from './models';

/** Result of loading a page: its data, a not-found state, or a load error. */
export type Loaded<T> =
  | { status: 'ok'; site: Site; data: T }
  | { status: 'not-found'; site: Site | null }
  | { status: 'error'; message: string };

/**
 * Route resolver that loads the site-wide data plus the page's own data before the page renders
 * (on the server for the first view, in the browser on navigation).
 */
export function pageResolver<T>(load: (api: ApiService, route: ActivatedRouteSnapshot) => Observable<T>): ResolveFn<Loaded<T>> {
  return (route) => {
    const api = inject(ApiService);
    return combineLatest([api.site(), load(api, route)]).pipe(
      map(([site, data]): Loaded<T> => ({ status: 'ok', site, data })),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return api.site().pipe(
            map((site): Loaded<T> => ({ status: 'not-found', site })),
            catchError(() => of<Loaded<T>>({ status: 'not-found', site: null })),
          );
        }
        return of<Loaded<T>>({ status: 'error', message: 'This page could not be loaded right now.' });
      }),
    );
  };
}

/** Pages that only need the site-wide data. */
export const siteResolver = pageResolver<null>(() => of(null));
