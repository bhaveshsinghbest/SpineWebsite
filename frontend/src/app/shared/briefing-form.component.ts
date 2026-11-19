import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import type { Site } from '../core/models';
import { IconComponent } from './icon.component';

/** Enquiry / briefing request. Stored in the database and notified to the firm by email. */
@Component({
  selector: 'app-briefing-form',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="stack-6" [class.pb-6]="!status()" novalidate (ngSubmit)="submit()">
      <div class="grid gap-6">
        <div class="g-col-12 g-col-sm-6">
          <label class="form-label" for="f-name">Name &amp; designation *</label>
          <input id="f-name" formControlName="name" maxlength="120" autocomplete="name" class="form-control" placeholder="e.g. Project Director, State PWD" />
          @if (err('name'); as e) { <p class="field-error">{{ e }}</p> }
        </div>
        <div class="g-col-12 g-col-sm-6">
          <label class="form-label" for="f-org">Ministry / organisation *</label>
          <input id="f-org" formControlName="organisation" maxlength="160" autocomplete="organization" class="form-control" placeholder="Department, authority or company" />
          @if (err('organisation'); as e) { <p class="field-error">{{ e }}</p> }
        </div>
      </div>
      <div class="grid gap-6">
        <div class="g-col-12 g-col-sm-6">
          <label class="form-label" for="f-email">Official email *</label>
          <input id="f-email" type="email" formControlName="email" maxlength="120" autocomplete="email" class="form-control" placeholder="name@dept.gov.in" />
          @if (err('email'); as e) { <p class="field-error">{{ e }}</p> }
        </div>
        <div class="g-col-12 g-col-sm-6">
          <label class="form-label" for="f-phone">Telephone / mobile *</label>
          <input id="f-phone" type="tel" formControlName="phone" maxlength="20" autocomplete="tel" class="form-control" placeholder="+91" />
          @if (err('phone'); as e) { <p class="field-error">{{ e }}</p> }
        </div>
      </div>
      <div>
        <label class="form-label" for="f-sector">Area of interest *</label>
        <select id="f-sector" formControlName="area" class="form-select">
          <option value="" disabled>Select a sector or practice</option>
          @for (g of groups(); track g.label) {
            <optgroup [label]="g.label">@for (o of g.options; track o) { <option [value]="o">{{ o }}</option> }</optgroup>
          }
          <option value="Other">Other</option>
        </select>
        @if (err('area'); as e) { <p class="field-error">{{ e }}</p> }
      </div>
      <div>
        <label class="form-label" for="f-scope">Project scale &amp; scope</label>
        <textarea id="f-scope" formControlName="message" rows="5" maxlength="3000" class="form-control"
          placeholder="Estimated capex, geography, current stage (feasibility / bid process / construction) and the advisory support you need."></textarea>
      </div>
      <div class="d-none" aria-hidden="true"><label>Leave empty<input type="text" formControlName="company_website" tabindex="-1" autocomplete="off" /></label></div>
      <div class="d-flex flex-column align-items-start justify-content-between gap-4 flex-sm-row align-items-sm-center">
        <p class="d-flex align-items-center gap-2 fs-small text-muted"><span icon="lock" [size]="16"></span> Handled in strict confidence. Acknowledged within one working day.</p>
        <button type="submit" class="btn btn-primary w-100 flex-shrink-0 text-nowrap w-sm-auto" [disabled]="sending()">
          @if (sending()) { <span class="spinner spinner-sm" aria-hidden="true"></span> Sending… } @else { Send enquiry <span icon="send" [size]="18"></span> }
        </button>
      </div>
      @if (status(); as s) { <p class="form-status" [class.ok]="s.ok" [class.error]="!s.ok" role="status" aria-live="polite">{{ s.text }}</p> }
    </form>
  `,
  styles: `
    :host { display: block; }
    .spinner-sm { width: 1rem; height: 1rem; }
    @media (min-width: 640px) { .w-sm-auto { width: auto !important; } }
  `,
})
export class BriefingFormComponent {
  readonly site = input.required<Site>();
  private api = inject(ApiService);
  private fb = inject(NonNullableFormBuilder);
  private started = Date.now();

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    organisation: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{8,20}$/)]],
    area: ['', Validators.required],
    message: ['', Validators.maxLength(3000)],
    company_website: [''],
  });
  readonly sending = signal(false);
  readonly status = signal<{ ok: boolean; text: string } | null>(null);
  private serverErrors = signal<Record<string, string[]>>({});

  readonly groups = computed(() => {
    const n = this.site().navigation;
    return [
      { label: 'Industries', options: n.industries.map((x) => x.title) },
      { label: 'Infrastructure sectors', options: n.sectors.map((x) => x.title) },
      { label: 'Strategic pillars', options: n.pillars.map((x) => x.title) },
      { label: 'Services', options: n.practices.map((x) => x.title) },
    ].filter((g) => g.options.length);
  });

  err(name: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[name];
    const server = this.serverErrors()[name]?.[0];
    if (server) return server;
    if (!c.touched || c.valid) return null;
    if (c.hasError('required')) return 'This field is required.';
    if (c.hasError('email')) return 'Enter a valid email address.';
    if (c.hasError('pattern')) return 'Enter a valid phone number.';
    return 'Please check this field.';
  }

  submit() {
    this.serverErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.status.set({ ok: false, text: 'Please complete the highlighted fields and try again.' });
      return;
    }
    this.sending.set(true);
    this.status.set(null);
    this.api.submitEnquiry({ ...this.form.getRawValue(), form_started: this.started }).subscribe({
      next: () => {
        this.sending.set(false);
        this.form.reset();
        this.started = Date.now();
        this.status.set({ ok: true, text: 'Thank you. Your enquiry has been received and a partner will be in touch within one working day.' });
      },
      error: (e) => {
        this.sending.set(false);
        this.serverErrors.set(apiFieldErrors(e));
        this.status.set({ ok: false, text: `${apiErrorMessage(e, 'Sorry, the enquiry could not be sent.')} You can also email ${this.site().company.email} directly.` });
      },
    });
  }
}
