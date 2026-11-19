import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import { AdminApi } from './admin-api.service';
import { FieldComponent } from './field.component';
import { buildForm, toPayload } from './form-engine';
import { LookupService } from './lookups.service';
import { contentBlockByKey } from './resources';
import { ADMIN_UI, ToastService } from './ui';

const nullsToEmpty = (v: unknown): unknown =>
  v === null ? '' : Array.isArray(v) ? v.map(nullsToEmpty) : typeof v === 'object' ? Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, nullsToEmpty(x)])) : v;

/** Editor for one site content block (homepage, page headings, About Us texts, company details, footer, career settings …). */
@Component({
  selector: 'app-admin-content',
  imports: [ReactiveFormsModule, FieldComponent, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block(); as b) {
      @if (!embedded()) { <app-page-header [title]="b.label" [subtitle]="b.description" /> }
      @else { <p class="text-muted mb-3">{{ b.description }}</p> }
      @if (form(); as f) {
        <form [formGroup]="f" (ngSubmit)="save()" novalidate>
          <div class="card mb-3"><div class="card-body">
            <app-field [field]="b.field" [control]="f.get('value')" />
          </div></div>
          @if (message(); as m) { <div class="alert alert-danger" role="alert">{{ m }}</div> }
          <div class="d-flex flex-wrap align-items-center gap-3 sticky-bottom bg-light py-2 save-bar">
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span>Saving… } @else { Save and publish }
            </button>
            @if (f.dirty && !saving()) { <span class="small text-muted">Unsaved changes</span> }
            @if (updatedAt()) { <span class="small text-muted ms-auto">Last published {{ updatedAt() }}</span> }
          </div>
        </form>
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      } @else {
        <div class="text-center py-5"><span class="spinner-border text-secondary"></span></div>
      }
    } @else {
      <div class="alert alert-warning">Unknown content section.</div>
    }
  `,
})
export class AdminContentPage {
  readonly key = input.required<string>();
  readonly embedded = input(false);
  private api = inject(AdminApi);
  private toast = inject(ToastService);
  private lookups = inject(LookupService);
  readonly block = computed(() => contentBlockByKey(this.key()));
  readonly form = signal<FormGroup | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly updatedAt = signal('');
  readonly message = signal('');

  constructor() {
    effect(() => {
      const b = this.block();
      untracked(() => {
        this.form.set(null);
        this.message.set('');
        this.error.set('');
        if (!b) return;
        this.api.getContent(b.key).subscribe({
          next: (r) => {
            this.form.set(buildForm([b.field], { value: r.data }));
            this.updatedAt.set(r.updatedAt ? new Date(r.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
          },
          error: (e) => this.error.set(apiErrorMessage(e)),
        });
      });
    });
  }

  save() {
    const f = this.form()!;
    const b = this.block()!;
    if (f.invalid) {
      f.markAllAsTouched();
      this.message.set('Please fix the highlighted fields.');
      return;
    }
    const data = nullsToEmpty(toPayload([b.field], f.getRawValue())['value']);
    this.saving.set(true);
    this.message.set('');
    this.api.saveContent(b.key, data).subscribe({
      next: (r) => {
        this.saving.set(false);
        f.markAsPristine();
        this.updatedAt.set(new Date(r.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
        if (b.invalidates) this.lookups.invalidate(...b.invalidates);
        this.toast.success(`${b.label} saved. The website has been updated.`);
      },
      error: (e) => {
        this.saving.set(false);
        const details = apiFieldErrors(e);
        const first = Object.entries(details)[0];
        this.message.set(first ? `${apiErrorMessage(e)} (${first[0]}: ${first[1][0]})` : apiErrorMessage(e, 'Could not save.'));
      },
    });
  }
}
