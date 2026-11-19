import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import { AdminApi } from './admin-api.service';
import { FieldComponent } from './field.component';
import { applyServerErrors, buildForm, lookupsOf, slugify, toPayload, type Field } from './form-engine';
import { LookupService } from './lookups.service';
import { resourceByName } from './resources';
import { ADMIN_UI, ConfirmService, ToastService } from './ui';

/** Generic create / edit form for any content type, generated from its field definitions. */
@Component({
  selector: 'app-resource-edit',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cfg(); as c) {
      <app-page-header [title]="isNew() ? 'New ' + c.singular : (title() || 'Edit ' + c.singular)" [back]="{ label: backLabel() ?? c.label, href: base() }">
        @if (publicUrl(); as url) { <a class="btn btn-sm btn-outline-secondary" [href]="url" target="_blank" rel="noopener"><span class="icon me-1" aria-hidden="true">open_in_new</span>View on website</a> }
        @if (!isNew()) { <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove()"><span class="icon me-1" aria-hidden="true">delete</span>Delete</button> }
      </app-page-header>
      @if (loadError()) { <div class="alert alert-danger">{{ loadError() }}</div> }
      @if (message(); as m) { <div class="alert" [class.alert-success]="m.ok" [class.alert-danger]="!m.ok" role="status">{{ m.text }}</div> }
      @if (form(); as f) {
        <form [formGroup]="f" (ngSubmit)="save()" novalidate>
          <div class="card mb-3"><div class="card-body row g-3">
            @for (field of c.fields; track field.key) {
              <div [class]="col(field)"><app-field [field]="field" [control]="f.get(field.key)" /></div>
            }
          </div></div>
          <div class="d-flex gap-2 sticky-bottom bg-light py-2 save-bar">
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span>Saving… } @else { {{ isNew() ? 'Create' : 'Save changes' }} }
            </button>
            <a class="btn btn-outline-secondary" [routerLink]="base()">Cancel</a>
            @if (f.dirty && !saving()) { <span class="small text-muted align-self-center">Unsaved changes</span> }
          </div>
        </form>
      } @else if (!loadError()) {
        <div class="text-center py-5"><span class="spinner-border text-secondary"></span></div>
      }
    }
  `,
})
export class ResourceEditPage {
  readonly resource = input.required<string>();
  readonly id = input.required<string>();
  readonly basePath = input<string | undefined>(undefined, { alias: 'base' });
  readonly backLabel = input<string | undefined>();
  private api = inject(AdminApi);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private lookups = inject(LookupService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  readonly cfg = computed(() => resourceByName(this.resource()));
  readonly base = computed(() => this.basePath() ?? `/admin/content/r/${this.resource()}`);
  readonly isNew = computed(() => this.id() === 'new');
  readonly form = signal<FormGroup | null>(null);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly message = signal<{ ok: boolean; text: string } | null>(null);
  readonly saved = signal<Record<string, any> | null>(null);
  readonly title = computed(() => { const s = this.saved(); return s ? (s['title'] ?? s['name'] ?? s['city'] ?? s['fromPath']) : ''; });
  readonly publicUrl = computed(() => { const s = this.saved(); const c = this.cfg(); return s && c?.publicUrl ? c.publicUrl(s) : null; });

  constructor() {
    effect(() => {
      const c = this.cfg();
      const id = this.id();
      untracked(() => {
        if (c) this.lookups.load(lookupsOf(c.fields));
        this.load(c?.name, id);
      });
    });
  }

  col = (f: Field) => (f.wide || ['textarea', 'list', 'objects', 'group', 'multiselect', 'image'].includes(f.type) ? 'col-12' : 'col-md-6');

  private load(name: string | undefined, id: string) {
    const c = this.cfg();
    if (!name || !c) return;
    this.form.set(null);
    this.message.set(null);
    this.loadError.set('');
    if (id === 'new') {
      this.saved.set(null);
      const defaults = { ...(typeof c.defaults === 'function' ? c.defaults() : c.defaults ?? {}) };
      const kind = this.route.snapshot.queryParamMap.get('kind');
      if (kind && c.tabs) defaults[c.tabs.key] = kind;
      this.setForm(defaults);
      return;
    }
    this.api.get(name, id).subscribe({
      next: (row) => { this.saved.set(row); this.setForm(row); },
      error: (e) => this.loadError.set(apiErrorMessage(e, 'This item could not be loaded.')),
    });
  }

  private setForm(value: Record<string, any>) {
    const c = this.cfg()!;
    const f = buildForm(c.fields, value);
    // New items: generate the slug from the title until the slug is edited by hand.
    if (this.isNew() && c.slugFrom && f.get('slug')) {
      const slug = f.get('slug')!;
      f.get(c.slugFrom)!.valueChanges.subscribe((v: string) => { if (!slug.dirty) slug.setValue(slugify(v ?? ''), { emitEvent: false }); });
    }
    this.form.set(f);
  }

  save() {
    const c = this.cfg()!;
    const f = this.form()!;
    if (f.invalid) {
      f.markAllAsTouched();
      this.message.set({ ok: false, text: 'Please fix the highlighted fields.' });
      return;
    }
    this.saving.set(true);
    this.message.set(null);
    const body = toPayload(c.fields, f.getRawValue());
    const req = this.isNew() ? this.api.create(c.name, body) : this.api.update(c.name, this.id(), body);
    req.subscribe({
      next: (row) => {
        this.saving.set(false);
        this.saved.set(row);
        f.markAsPristine();
        if (c.invalidates) this.lookups.invalidate(...c.invalidates);
        this.toast.success(this.isNew() ? `${c.singular[0].toUpperCase() + c.singular.slice(1)} created.` : 'Changes saved. The website has been updated.');
        if (this.isNew()) this.router.navigate([this.base(), row['id']], { replaceUrl: true });
      },
      error: (e) => {
        this.saving.set(false);
        applyServerErrors(f, apiFieldErrors(e));
        this.message.set({ ok: false, text: apiErrorMessage(e, 'Could not save.') });
      },
    });
  }

  async remove() {
    const c = this.cfg()!;
    if (!(await this.confirm.ask({ title: `Delete ${c.singular}?`, message: `“${this.title()}” will be deleted permanently. This cannot be undone.`, confirmLabel: 'Delete', danger: true }))) return;
    this.api.remove(c.name, this.id()).subscribe({
      next: () => {
        if (c.invalidates) this.lookups.invalidate(...c.invalidates);
        this.toast.success(`Deleted “${this.title()}”.`);
        this.router.navigateByUrl(this.base());
      },
      error: (e) => this.toast.error(apiErrorMessage(e)),
    });
  }
}
