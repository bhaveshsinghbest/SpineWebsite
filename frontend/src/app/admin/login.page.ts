import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import { AuthService } from './auth.service';

/** Loads the admin stylesheet and icon font on pages outside the admin layout (login, password reset). */
export function loadAdminAssets(doc: Document, title: string) {
  const add = (id: string, href: string) => {
    if (doc.getElementById(id)) return;
    const l = doc.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = href;
    doc.head.appendChild(l);
  };
  add('admin-css', '/admin.css');
  add('admin-icons', 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
  doc.title = title;
}

/** Card layout shared by the login, forgot-password and reset-password pages. */
export const AUTH_CARD_START = `
  <div class="admin-shell auth-page d-flex align-items-center justify-content-center p-3">
    <div class="auth-card card shadow-sm">
      <div class="card-body p-4 p-sm-5">
        <div class="text-center mb-4">
          <a routerLink="/" aria-label="Back to the website"><img src="/assets/brand/logo.png" alt="Spine Advisory" class="auth-logo" /></a>
          <p class="auth-brand mt-3 mb-0">SPINE ADVISORY <span>ADMIN PANEL</span></p>
        </div>`;
export const AUTH_CARD_END = `
      </div>
    </div>
  </div>`;

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: AUTH_CARD_START + `
        <h1 class="h5 text-center mb-1">Admin login</h1>
        <p class="text-muted small text-center mb-4">Sign in with the administrator username and password.</p>
        @if (notice(); as n) { <div class="alert alert-warning py-2 small" role="status">{{ n }}</div> }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="mb-3">
            <label class="form-label" for="username">Username</label>
            <input id="username" type="text" class="form-control" formControlName="username" autocomplete="username" autocapitalize="none" spellcheck="false" autofocus
                   [class.is-invalid]="fieldError('username')" />
            @if (fieldError('username'); as e) { <div class="invalid-feedback">{{ e }}</div> }
          </div>
          <div class="mb-2">
            <label class="form-label" for="password">Password</label>
            <div class="input-group has-validation">
              <input id="password" [type]="show() ? 'text' : 'password'" class="form-control" formControlName="password" autocomplete="current-password" [class.is-invalid]="fieldError('password')" />
              <button type="button" class="btn btn-outline-secondary" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'" [attr.aria-pressed]="show()">
                <span class="icon" aria-hidden="true">{{ show() ? 'visibility_off' : 'visibility' }}</span>
              </button>
              @if (fieldError('password'); as e) { <div class="invalid-feedback">{{ e }}</div> }
            </div>
          </div>
          <div class="text-end mb-3"><a routerLink="/admin/forgot-password" class="small">Forgot password?</a></div>
          @if (error()) { <div class="alert alert-danger py-2 small" role="alert">{{ error() }}</div> }
          <button type="submit" class="btn btn-primary w-100" [disabled]="busy()">
            @if (busy()) { <span class="spinner-border spinner-border-sm me-2"></span>Signing in… } @else { Sign in }
          </button>
        </form>
        <p class="text-center small mt-4 mb-0"><a routerLink="/" class="text-muted">← Back to the website</a></p>
  ` + AUTH_CARD_END,
})
export class AdminLoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly form = inject(NonNullableFormBuilder).group({ username: ['', Validators.required], password: ['', Validators.required] });
  readonly busy = signal(false);
  readonly error = signal('');
  readonly show = signal(false);
  readonly submitted = signal(false);
  readonly serverErrors = signal<Record<string, string>>({});
  readonly notice = computed(() => {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('expired')) return 'Your session has expired. Please sign in again.';
    if (q.get('reset')) return 'Your password has been changed. Sign in with the new password.';
    if (q.get('signedOut')) return 'You have been signed out.';
    return '';
  });

  constructor() { loadAdminAssets(inject(DOCUMENT), 'Admin login | Spine Advisory'); }

  fieldError(key: 'username' | 'password') {
    const server = this.serverErrors()[key];
    if (server) return server;
    if (!this.submitted()) return null;
    return this.form.controls[key].invalid ? (key === 'username' ? 'Enter your username.' : 'Enter your password.') : null;
  }

  submit() {
    this.submitted.set(true);
    this.serverErrors.set({});
    this.error.set('');
    if (this.form.invalid) return;
    this.busy.set(true);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username.trim(), password).subscribe({
      next: () => {
        const next = this.route.snapshot.queryParamMap.get('next');
        const safe = next && next.startsWith('/admin') && !/^\/admin\/(login|forgot-password|reset-password)/.test(next) ? next : '/admin';
        this.router.navigateByUrl(safe);
      },
      error: (e) => {
        this.busy.set(false);
        this.form.controls.password.reset();
        const d = apiFieldErrors(e);
        this.serverErrors.set(Object.fromEntries(Object.entries(d).map(([k, m]) => [k, m[0]])));
        if (!Object.keys(d).length) this.error.set(apiErrorMessage(e, 'Sign-in failed.'));
      },
    });
  }
}
