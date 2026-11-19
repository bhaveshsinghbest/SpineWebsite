import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/** Incremented whenever the API reports that the admin session is missing or expired (HTTP 401). */
export const sessionExpired = signal(0);

/** Admin and auth calls: send the session cookie and the CSRF header; on 401, go to the login page. */
export const adminApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/admin') && !req.url.startsWith('/api/auth')) return next(req);
  const router = inject(Router);
  return next(req.clone({ withCredentials: true, setHeaders: { 'X-Requested-With': 'XMLHttpRequest' } })).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.startsWith('/api/auth/')) {
        sessionExpired.update((n) => n + 1);
        const current = router.url;
        if (!current.startsWith('/admin/login')) {
          router.navigate(['/admin/login'], { queryParams: { next: current.startsWith('/admin') ? current : null, expired: 1 } });
        }
      }
      return throwError(() => err);
    }),
  );
};

/** Extracts a readable message from an API error response. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Could not reach the server. Check your connection and try again.';
    return err.error?.error?.message ?? fallback;
  }
  return fallback;
}

/** Field-level errors returned by the API ({ field: [messages] }). */
export function apiFieldErrors(err: unknown): Record<string, string[]> {
  return err instanceof HttpErrorResponse ? (err.error?.error?.details ?? {}) : {};
}
