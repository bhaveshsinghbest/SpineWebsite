// Forgot Password: request a time-limited, single-use reset link, then choose a new password.
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import { AuthService } from './auth.service';
import { AUTH_CARD_END, AUTH_CARD_START, loadAdminAssets } from './login.page';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: AUTH_CARD_START + `
        <h1 class="h5 text-center mb-1">Forgot password</h1>
        @if (sent()) {
          <div class="alert alert-success small" role="status">{{ sent() }}</div>
          <p class="small text-muted">Check the administrator’s email inbox (and the spam folder). The link can be used once.</p>
          <a routerLink="/admin/login" class="btn btn-primary w-100">Back to login</a>
        } @else {
          <p class="text-muted small text-center mb-4">Enter the administrator username or email. A link to choose a new password will be emailed to the account’s address.</p>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="mb-3">
              <label class="form-label" for="username">Username or email</label>
              <input id="username" type="text" class="form-control" formControlName="username" autocomplete="username" autocapitalize="none" autofocus [class.is-invalid]="invalid()" />
              @if (invalid()) { <div class="invalid-feedback">Enter your username or email.</div> }
            </div>
            @if (error()) { <div class="alert alert-danger py-2 small" role="alert">{{ error() }}</div> }
            <button type="submit" class="btn btn-primary w-100" [disabled]="busy()">
              @if (busy()) { <span class="spinner-border spinner-border-sm me-2"></span>Sending… } @else { Send reset link }
            </button>
          </form>
          <p class="text-center small mt-4 mb-0"><a routerLink="/admin/login">← Back to login</a></p>
        }
  ` + AUTH_CARD_END,
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  readonly form = inject(NonNullableFormBuilder).group({ username: ['', Validators.required] });
  readonly busy = signal(false);
  readonly error = signal('');
  readonly sent = signal('');
  readonly invalid = signal(false);
  constructor() { loadAdminAssets(inject(DOCUMENT), 'Forgot password | Spine Advisory admin'); }
  submit() {
    this.invalid.set(this.form.invalid);
    if (this.form.invalid) return;
    this.busy.set(true);
    this.error.set('');
    this.auth.forgotPassword(this.form.getRawValue().username.trim()).subscribe({
      next: (r) => { this.busy.set(false); this.sent.set(r.message); },
      error: (e) => { this.busy.set(false); this.error.set(apiErrorMessage(e)); },
    });
  }
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: AUTH_CARD_START + `
        <h1 class="h5 text-center mb-1">Choose a new password</h1>
        @switch (state()) {
          @case ('checking') { <div class="text-center py-4"><span class="spinner-border text-secondary"></span></div> }
          @case ('invalid') {
            <div class="alert alert-danger small mt-3" role="alert">{{ error() }}</div>
            <a routerLink="/admin/forgot-password" class="btn btn-primary w-100">Request a new link</a>
          }
          @default {
            <p class="text-muted small text-center mb-4">At least 12 characters, with upper-case and lower-case letters and a number. All signed-in sessions will be signed out.</p>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="mb-3">
                <label class="form-label" for="password">New password</label>
                <input id="password" type="password" class="form-control" formControlName="password" autocomplete="new-password" autofocus [class.is-invalid]="fieldError()" />
              </div>
              <div class="mb-3">
                <label class="form-label" for="confirm">Confirm new password</label>
                <input id="confirm" type="password" class="form-control" formControlName="confirm" autocomplete="new-password" [class.is-invalid]="fieldError()" />
                @if (fieldError(); as e) { <div class="invalid-feedback d-block">{{ e }}</div> }
              </div>
              @if (error()) { <div class="alert alert-danger py-2 small" role="alert">{{ error() }}</div> }
              <button type="submit" class="btn btn-primary w-100" [disabled]="busy()">
                @if (busy()) { <span class="spinner-border spinner-border-sm me-2"></span>Saving… } @else { Set new password }
              </button>
            </form>
          }
        }
  ` + AUTH_CARD_END,
})
export class ResetPasswordPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
  readonly form = inject(NonNullableFormBuilder).group({ password: ['', [Validators.required, Validators.minLength(12)]], confirm: ['', Validators.required] });
  readonly state = signal<'checking' | 'invalid' | 'ready'>('checking');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly fieldError = signal('');

  constructor() {
    loadAdminAssets(inject(DOCUMENT), 'Reset password | Spine Advisory admin');
    if (!this.token) {
      this.state.set('invalid');
      this.error.set('This reset link is incomplete. Request a new one.');
      return;
    }
    this.auth.checkResetToken(this.token).subscribe({
      next: () => this.state.set('ready'),
      error: (e) => { this.state.set('invalid'); this.error.set(apiErrorMessage(e, 'This reset link is invalid or has expired.')); },
    });
  }

  submit() {
    const { password, confirm } = this.form.getRawValue();
    this.error.set('');
    if (password.length < 12) return this.fieldError.set('Use at least 12 characters.');
    if (password !== confirm) return this.fieldError.set('The two passwords do not match.');
    this.fieldError.set('');
    this.busy.set(true);
    this.auth.resetPassword(this.token, password).subscribe({
      next: () => this.router.navigate(['/admin/login'], { queryParams: { reset: 1 } }),
      error: (e) => {
        this.busy.set(false);
        const d = apiFieldErrors(e)['password'];
        if (d) this.fieldError.set(d[0]);
        else this.error.set(apiErrorMessage(e));
      },
    });
  }
}
