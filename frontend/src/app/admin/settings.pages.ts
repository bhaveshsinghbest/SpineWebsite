// Media library, audit log and the administrator's account.
import { DatePipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import { AdminApi, type ListResult } from './admin-api.service';
import { auditAction, auditModule } from './audit-labels';
import { AuthService } from './auth.service';
import { ADMIN_UI, ConfirmService, ToastService, cleanQuery, type SortState } from './ui';

// ---------- Media library ----------
@Component({
  selector: 'app-admin-media',
  imports: [FormsModule, DatePipe, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!embedded()) { <app-page-header title="Media library" subtitle="Images and documents used on the website." /> }
    <div class="card mb-3"><div class="card-body">
      <h2 class="h6">Upload</h2>
      <p class="small text-muted">Images: JPG, PNG or WebP up to 8 MB (resized and converted to WebP; metadata removed). Documents: PDF, DOC or DOCX. Copy a file’s address into any image field, or upload directly from the field.</p>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <select class="form-select w-auto" [(ngModel)]="kind" aria-label="File type">
          <option value="image">Image</option><option value="document">Document</option>
        </select>
        <input type="text" class="form-control" style="max-width:280px" placeholder="Description (alt text)" [(ngModel)]="alt" maxlength="255" />
        <label class="btn btn-primary mb-0">
          <span class="icon me-1" aria-hidden="true">upload</span>{{ uploading() ? 'Uploading…' : 'Choose file & upload' }}
          <input type="file" class="d-none" [accept]="kind === 'image' ? 'image/jpeg,image/png,image/webp' : '.pdf,.doc,.docx'" (change)="upload($any($event.target))" [disabled]="uploading()" />
        </label>
      </div>
    </div></div>
    <div class="d-flex flex-wrap gap-2 mb-3 filter-bar">
      <div class="input-group search">
        <span class="input-group-text bg-white"><span class="icon" aria-hidden="true">search</span></span>
        <input type="search" class="form-control" placeholder="Search file name or description…" [ngModel]="qInput()" (ngModelChange)="search($event)" aria-label="Search files" />
      </div>
      <select class="form-select w-auto" [ngModel]="filterKind()" (ngModelChange)="filterKind.set($event)" aria-label="Filter by type">
        <option value="">Images and documents</option><option value="image">Images</option><option value="document">Documents</option>
      </select>
      <select class="form-select w-auto" [ngModel]="sortKey()" (ngModelChange)="sortKey.set($event)" aria-label="Sort">
        <option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="originalName:asc">Name A–Z</option><option value="sizeBytes:desc">Largest first</option>
      </select>
    </div>
    <div class="row g-3 mb-3">
      @for (m of result()?.data; track m['id']) {
        <div class="col-6 col-md-4 col-xl-3"><div class="card h-100">
          @if (m['kind'] === 'image') { <img [src]="m['url']" [alt]="m['alt'] ?? ''" class="card-img-top media-thumb" loading="lazy" /> }
          @else { <div class="d-flex align-items-center justify-content-center bg-light media-thumb"><span class="icon" style="font-size:48px" aria-hidden="true">description</span></div> }
          <div class="card-body p-2 small">
            <div class="text-truncate fw-semibold" [title]="m['originalName']">{{ m['originalName'] }}</div>
            <div class="text-muted">{{ m['createdAt'] | date: 'd MMM y' }} · {{ (m['sizeBytes'] / 1024).toFixed(0) }} KB</div>
            <div class="d-flex gap-1 mt-2">
              <button type="button" class="btn btn-sm btn-light border flex-grow-1" (click)="copy(m['url'])"><span class="icon me-1" aria-hidden="true">content_copy</span>Copy address</button>
              <a class="btn btn-sm btn-light border" [href]="m['url']" target="_blank" rel="noopener" title="Open"><span class="icon" aria-hidden="true">open_in_new</span></a>
              <button type="button" class="btn btn-sm btn-light border text-danger" (click)="remove(m)" title="Delete"><span class="icon" aria-hidden="true">delete</span></button>
            </div>
          </div>
        </div></div>
      } @empty { <p class="text-muted">{{ loading() ? 'Loading…' : 'No files found.' }}</p> }
    </div>
    @if (result(); as r) { <div class="card"><div class="card-body py-2"><app-pager [(page)]="page" [(pageSize)]="pageSize" [total]="r.meta.total" /></div></div> }
  `,
})
export class AdminMediaPage {
  readonly embedded = input(false);
  private api = inject(AdminApi);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  readonly result = signal<ListResult | null>(null);
  readonly uploading = signal(false);
  readonly loading = signal(true);
  readonly qInput = signal('');
  readonly q = signal('');
  readonly filterKind = signal('');
  readonly sortKey = signal('createdAt:desc');
  readonly page = signal(1);
  readonly pageSize = signal(20);
  kind: 'image' | 'document' = 'image';
  alt = '';
  private debounce?: ReturnType<typeof setTimeout>;
  private readonly query = computed(() => {
    const [sort, dir] = this.sortKey().split(':');
    return cleanQuery({ q: this.q(), kind: this.filterKind(), sort, dir, page: this.page(), pageSize: this.pageSize() });
  });

  constructor() {
    effect(() => { const q = this.query(); untracked(() => this.load(q)); });
    effect(() => { this.q(); this.filterKind(); this.sortKey(); this.pageSize(); untracked(() => this.page.set(1)); });
  }
  private load(q: Record<string, string | number>) {
    this.loading.set(true);
    this.api.list('media', q).subscribe({ next: (r) => { this.result.set(r); this.loading.set(false); }, error: (e) => { this.loading.set(false); this.toast.error(apiErrorMessage(e)); } });
  }
  search(v: string) { this.qInput.set(v); clearTimeout(this.debounce); this.debounce = setTimeout(() => this.q.set(v.trim()), 300); }
  upload(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { this.toast.error('The file is larger than 8 MB.'); input.value = ''; return; }
    this.uploading.set(true);
    this.api.upload(file, this.kind, this.alt).subscribe({
      next: (r) => { this.uploading.set(false); this.toast.success(`Uploaded ${r.originalName}.`); this.alt = ''; input.value = ''; this.load(this.query()); },
      error: (e) => { this.uploading.set(false); this.toast.error(apiErrorMessage(e, 'Upload failed.')); input.value = ''; },
    });
  }
  copy(url: string) { navigator.clipboard?.writeText(url).then(() => this.toast.info(`Copied ${url}`), () => this.toast.error('Copy failed — select the address manually.')); }
  async remove(m: Record<string, any>) {
    const ok = await this.confirm.ask({ title: 'Delete file?', message: `${m['originalName']} will be deleted. Pages that use it will show a missing image.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    this.api.remove('media', m['id']).subscribe({ next: () => { this.toast.success('File deleted.'); this.load(this.query()); }, error: (e) => this.toast.error(apiErrorMessage(e)) });
  }
}

// ---------- Audit log ----------
@Component({
  selector: 'app-admin-activity',
  imports: [FormsModule, DatePipe, KeyValuePipe, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Audit Log" subtitle="Admin activities and login history, newest first. Entries are read-only and cannot be edited or deleted." />
    <div class="card mb-3"><div class="card-body py-2 d-flex flex-wrap gap-2 align-items-center filter-bar">
      <div class="input-group search">
        <span class="input-group-text bg-white"><span class="icon" aria-hidden="true">search</span></span>
        <input type="search" class="form-control" placeholder="Search record, details or IP…" [ngModel]="qInput()" (ngModelChange)="search($event)" aria-label="Search the audit log" />
      </div>
      <select class="form-select w-auto" [ngModel]="action()" (ngModelChange)="action.set($event)" aria-label="Filter by action">
        <option value="">All actions</option>
        @for (a of actions(); track a) { <option [value]="a">{{ actionLabel(a) }}</option> }
      </select>
      <select class="form-select w-auto" [ngModel]="entity()" (ngModelChange)="entity.set($event)" aria-label="Filter by module">
        <option value="">All modules</option>
        @for (m of entities(); track m) { <option [value]="m">{{ moduleLabel(m) }}</option> }
      </select>
      <app-date-range label="Date" [(from)]="from" [(to)]="to" />
      <button type="button" class="btn btn-sm" [class.btn-outline-secondary]="action() !== 'login_failed'" [class.btn-danger]="action() === 'login_failed'" (click)="action.set(action() === 'login_failed' ? '' : 'login_failed')">Failed sign-ins</button>
      @if (hasFilters()) { <button type="button" class="btn btn-sm btn-link" (click)="clear()">Clear filters</button> }
    </div></div>
    <div class="card"><div class="table-responsive">
      <table class="table table-sm mb-0 audit">
        <thead><tr><th sortKey="createdAt" [(sort)]="sort">Date &amp; time</th><th>User</th><th sortKey="action" [(sort)]="sort">Action</th><th sortKey="entity" [(sort)]="sort">Module</th><th>Record</th><th>IP address</th><th></th></tr></thead>
        <tbody>
          @if (loading() && !result()) {
            <tr app-table-state [cols]="7" [loading]="true"></tr>
          } @else {
            @for (a of result()?.data; track a['id']) {
              <tr [class.table-danger]="a['action'] === 'login_failed'">
                <td class="text-nowrap small">{{ a['createdAt'] | date: 'd MMM y, HH:mm:ss' }}</td>
                <td>{{ a['user'] ?? '—' }}</td>
                <td class="text-nowrap">{{ actionLabel(a['action']) }}</td>
                <td class="text-nowrap">{{ moduleLabel(a['entity']) }}</td>
                <td class="small">@if (a['entityId']) { <span class="text-muted">#{{ a['entityId'] }}</span> } {{ a['summary'] ?? '' }}</td>
                <td class="small text-muted text-nowrap">{{ a['ip'] ?? '—' }}</td>
                <td class="text-end">
                  @if (a['details']) {
                    <button type="button" class="btn btn-sm btn-light border" (click)="toggle(a['id'])" [attr.aria-expanded]="open() === a['id']">{{ open() === a['id'] ? 'Hide' : 'Changes' }}</button>
                  }
                </td>
              </tr>
              @if (open() === a['id'] && a['details']) {
                <tr class="details-row"><td colspan="7">
                  <table class="table table-sm table-bordered bg-white mb-0 small">
                    <thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead>
                    <tbody>
                      @for (c of $any(a['details']) | keyvalue; track c.key) {
                        <tr><td class="fw-semibold">{{ c.key }}</td><td class="text-muted">{{ show($any(c.value)?.from) }}</td><td>{{ show($any(c.value)?.to) }}</td></tr>
                      }
                    </tbody>
                  </table>
                </td></tr>
              }
            } @empty { <tr app-table-state [cols]="7" [empty]="hasFilters() ? 'No entries match these filters.' : 'No activity yet.'"></tr> }
          }
        </tbody>
      </table>
    </div>
    @if (result(); as r) { <div class="card-footer bg-white"><app-pager [(page)]="page" [(pageSize)]="pageSize" [total]="r.meta.total" /></div> }
    </div>
  `,
})
export class AdminActivityPage {
  private api = inject(AdminApi);
  private toast = inject(ToastService);
  readonly actionLabel = auditAction;
  readonly moduleLabel = auditModule;
  readonly result = signal<ListResult | null>(null);
  readonly loading = signal(true);
  readonly qInput = signal('');
  readonly q = signal('');
  readonly action = signal('');
  readonly entity = signal('');
  readonly from = signal('');
  readonly to = signal('');
  readonly sort = signal<SortState | null>({ key: 'createdAt', dir: 'desc' });
  readonly page = signal(1);
  readonly pageSize = signal(50);
  readonly open = signal<number | null>(null);
  readonly actions = computed(() => (this.result()?.meta['actions'] as string[] | undefined) ?? []);
  readonly entities = computed(() => (this.result()?.meta['entities'] as string[] | undefined) ?? []);
  readonly hasFilters = computed(() => !!(this.q() || this.action() || this.entity() || this.from() || this.to()));
  private debounce?: ReturnType<typeof setTimeout>;
  private readonly filters = computed(() => cleanQuery({ q: this.q(), action: this.action(), entity: this.entity(), from: this.from(), to: this.to(), sort: this.sort()?.key, dir: this.sort()?.dir }));

  constructor() {
    effect(() => {
      const query = { ...this.filters(), page: this.page(), pageSize: this.pageSize() };
      untracked(() => {
        this.loading.set(true);
        this.api.list('activity', query).subscribe({
          next: (r) => { this.result.set(r); this.loading.set(false); },
          error: (e) => { this.loading.set(false); this.toast.error(apiErrorMessage(e)); },
        });
      });
    });
    effect(() => { this.filters(); this.pageSize(); untracked(() => this.page.set(1)); });
  }
  search(v: string) { this.qInput.set(v); clearTimeout(this.debounce); this.debounce = setTimeout(() => this.q.set(v.trim()), 300); }
  clear() { this.q.set(''); this.qInput.set(''); this.action.set(''); this.entity.set(''); this.from.set(''); this.to.set(''); }
  toggle(id: number) { this.open.set(this.open() === id ? null : id); }
  show(v: unknown) { return v === null || v === undefined || v === '' ? '—' : Array.isArray(v) ? v.join(' · ') : String(v); }
}

// ---------- My account ----------
@Component({
  selector: 'app-admin-account',
  imports: [ReactiveFormsModule, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="My account" subtitle="The single administrator account for this website." />
    <div class="row g-3">
      <div class="col-lg-5"><div class="card"><div class="card-body">
        <h2 class="h6">Account</h2>
        <dl class="row mb-0 small">
          <dt class="col-4 text-muted fw-normal">Name</dt><dd class="col-8">{{ auth.user()?.name }}</dd>
          <dt class="col-4 text-muted fw-normal">Username</dt><dd class="col-8">{{ auth.user()?.username ?? '—' }}</dd>
          <dt class="col-4 text-muted fw-normal">Email</dt><dd class="col-8">{{ auth.user()?.email }}</dd>
          <dt class="col-4 text-muted fw-normal">Auto sign-out</dt><dd class="col-8 mb-0">after {{ auth.idleMinutes() }} minutes without activity</dd>
        </dl>
      </div></div></div>
      <div class="col-lg-7"><div class="card"><div class="card-body">
        <h2 class="h6">Change password</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="mb-2"><label class="form-label" for="cur">Current password</label><input id="cur" type="password" class="form-control" formControlName="currentPassword" autocomplete="current-password" [class.is-invalid]="errors()['currentPassword']" />
            @if (errors()['currentPassword']) { <div class="invalid-feedback">{{ errors()['currentPassword'] }}</div> }</div>
          <div class="mb-2"><label class="form-label" for="new">New password</label><input id="new" type="password" class="form-control" formControlName="newPassword" autocomplete="new-password" [class.is-invalid]="errors()['newPassword']" />
            @if (errors()['newPassword']) { <div class="invalid-feedback">{{ errors()['newPassword'] }}</div> }</div>
          <div class="form-text mb-3">At least 12 characters, with upper-case and lower-case letters and a number. Other sessions are signed out.</div>
          <button type="submit" class="btn btn-primary" [disabled]="busy()">{{ busy() ? 'Saving…' : 'Change password' }}</button>
        </form>
      </div></div></div>
    </div>
  `,
})
export class AdminAccountPage {
  readonly auth = inject(AuthService);
  private toast = inject(ToastService);
  readonly form = inject(NonNullableFormBuilder).group({ currentPassword: ['', Validators.required], newPassword: ['', [Validators.required, Validators.minLength(12)]] });
  readonly busy = signal(false);
  readonly errors = signal<Record<string, string>>({});
  submit() {
    if (this.form.invalid) {
      this.errors.set({
        ...(this.form.controls.currentPassword.invalid ? { currentPassword: 'Enter your current password.' } : {}),
        ...(this.form.controls.newPassword.invalid ? { newPassword: 'Enter a new password of at least 12 characters.' } : {}),
      });
      return;
    }
    this.busy.set(true);
    this.errors.set({});
    const v = this.form.getRawValue();
    this.auth.changePassword(v.currentPassword, v.newPassword).subscribe({
      next: () => { this.busy.set(false); this.toast.success('Password changed. Other sessions were signed out.'); this.form.reset(); },
      error: (e) => {
        this.busy.set(false);
        const d = apiFieldErrors(e);
        this.errors.set(Object.fromEntries(Object.entries(d).map(([k, m]) => [k, m[0]])));
        if (!Object.keys(d).length) this.toast.error(apiErrorMessage(e));
      },
    });
  }
}
