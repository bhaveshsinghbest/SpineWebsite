import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { sessionExpired } from '../core/interceptors';

export type Role = 'admin';
export type Permission = 'content' | 'jobs' | 'applications' | 'enquiries' | 'projects' | 'announcements' | 'media' | 'redirects' | 'settings' | 'activity';
export interface AdminUser { id: number; username: string | null; email: string; name: string; role: Role }
interface Session { user: AdminUser; permissions: Permission[]; idleMinutes?: number }

/** Admin session state. The session itself is an HttpOnly cookie managed by the API (the browser cannot read it). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = signal<Session | null>(null);
  private checked = false;
  private seenExpiry = 0;

  readonly user = computed(() => this.session()?.user ?? null);
  readonly permissions = computed(() => new Set(this.session()?.permissions ?? []));
  /** Minutes of inactivity after which the server ends the session. */
  readonly idleMinutes = computed(() => this.session()?.idleMinutes ?? 30);
  can = (p: Permission) => this.permissions().has(p);

  /** Loads the current session (used by the route guard). Re-checks after the API reported an expired session. */
  async ensure(): Promise<boolean> {
    if (this.checked && this.seenExpiry === sessionExpired()) return !!this.session();
    this.seenExpiry = sessionExpired();
    const s = await firstValueFrom(this.http.get<Session>('/api/auth/me').pipe(catchError(() => of(null))));
    this.session.set(s);
    this.checked = true;
    return !!s;
  }

  login(username: string, password: string) {
    return this.http.post<Session>('/api/auth/login', { username, password }).pipe(tap((s) => {
      this.session.set(s);
      this.checked = true;
      this.seenExpiry = sessionExpired();
    }));
  }

  logout() {
    return this.http.post('/api/auth/logout', {}).pipe(
      catchError(() => of(null)),
      tap(() => this.clear()),
      map(() => true),
    );
  }

  /** Forget the session locally (after the server ended it). */
  clear() {
    this.session.set(null);
    this.checked = true;
  }

  /** Keeps the session alive (any authenticated request resets the server's idle timer). */
  ping() {
    return this.http.get<Session>('/api/auth/me');
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post('/api/auth/change-password', { currentPassword, newPassword });
  }

  forgotPassword(username: string) {
    return this.http.post<{ ok: boolean; message: string }>('/api/auth/forgot-password', { username });
  }

  checkResetToken(token: string) {
    return this.http.get<{ ok: boolean }>('/api/auth/reset-password', { params: { token } });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<{ ok: boolean }>('/api/auth/reset-password', { token, password });
  }
}

/** Only the signed-in administrator may open Admin Panel pages; direct URLs redirect to the login page. */
export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!(await auth.ensure())) return router.createUrlTree(['/admin/login'], { queryParams: { next: state.url } });
  const needed = route.data['permission'] as Permission | undefined;
  if (needed && !auth.can(needed)) return router.createUrlTree(['/admin']);
  return true;
};

/** The login, forgot-password and reset pages redirect to the dashboard when already signed in. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.ensure()) ? router.createUrlTree(['/admin']) : true;
};
