// Enquiries and job applications received through the website forms.
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../core/interceptors';
import { AdminApi, type ListResult } from './admin-api.service';
import { ADMIN_UI, ConfirmService, ToastService, cleanQuery, saveDownload, statusLabel, type SortState } from './ui';

interface Kind {
  resource: 'enquiries' | 'applications';
  label: string;
  singular: string;
  base: string;
  description: string;
  statuses: string[];
  columns: { key: string; label: string; sort?: string }[];
}
const KINDS: Record<string, Kind> = {
  enquiries: {
    resource: 'enquiries', label: 'Enquiry Management', singular: 'enquiry', base: '/admin/enquiries',
    description: 'All enquiries submitted through the website forms, with follow-ups.',
    statuses: ['new', 'in_progress', 'resolved', 'closed'],
    columns: [{ key: 'name', label: 'Name', sort: 'name' }, { key: 'organisation', label: 'Organisation', sort: 'organisation' }, { key: 'area', label: 'Category', sort: 'area' }, { key: 'followUpOn', label: 'Follow-up', sort: 'followUpOn' }],
  },
  applications: {
    resource: 'applications', label: 'Applications', singular: 'application', base: '/admin/careers/applications',
    description: 'Applications submitted on the Careers page, with résumés.',
    statuses: ['pending', 'shortlisted', 'rejected', 'selected'],
    columns: [{ key: 'name', label: 'Applicant', sort: 'name' }, { key: 'position', label: 'Position', sort: 'position' }, { key: 'location', label: 'Location', sort: 'location' }, { key: 'experienceYears', label: 'Exp. (yrs)', sort: 'experienceYears' }],
  },
};

@Component({
  selector: 'app-submission-list',
  imports: [RouterLink, FormsModule, DatePipe, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!embedded()) { <app-page-header [title]="kind().label" [subtitle]="kind().description">
      <button type="button" class="btn btn-outline-secondary" (click)="exportCsv()" [disabled]="exporting()"><span class="icon me-1" aria-hidden="true">download</span>{{ exporting() ? 'Exporting…' : 'Export to Excel (CSV)' }}</button>
    </app-page-header> } @else {
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <p class="text-muted mb-0">{{ kind().description }}</p>
        <button type="button" class="btn btn-outline-secondary" (click)="exportCsv()" [disabled]="exporting()"><span class="icon me-1" aria-hidden="true">download</span>{{ exporting() ? 'Exporting…' : 'Export to Excel (CSV)' }}</button>
      </div>
    }
    <div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filter by status">
      <button type="button" class="btn btn-sm" [class.btn-primary]="!status()" [class.btn-outline-secondary]="!!status()" (click)="status.set('')">All</button>
      @for (s of kind().statuses; track s) {
        <button type="button" class="btn btn-sm" [class.btn-primary]="status() === s" [class.btn-outline-secondary]="status() !== s" (click)="status.set(s)">{{ label(s) }}</button>
      }
    </div>
    <div class="card mb-3"><div class="card-body py-2 d-flex flex-wrap gap-2 align-items-center filter-bar">
      <div class="input-group search">
        <span class="input-group-text bg-white"><span class="icon" aria-hidden="true">search</span></span>
        <input type="search" class="form-control" [placeholder]="kind().resource === 'enquiries' ? 'Search name, organisation, email, phone…' : 'Search name, email, position…'" [ngModel]="qInput()" (ngModelChange)="search($event)" aria-label="Search" />
      </div>
      @if (kind().resource === 'enquiries') {
        <select class="form-select w-auto" [ngModel]="area()" (ngModelChange)="area.set($event)" aria-label="Filter by category">
          <option value="">All categories</option>
          @for (a of areas(); track a) { <option [value]="a">{{ a }}</option> }
        </select>
      } @else {
        <select class="form-select w-auto" [ngModel]="job()" (ngModelChange)="job.set($event)" aria-label="Filter by job opening">
          <option value="">All job openings</option>
          @for (j of jobs(); track j.id) { <option [value]="j.id">{{ j.title }}</option> }
        </select>
      }
      <span class="small text-muted ms-1">Received:</span>
      <app-date-range label="Received" [(from)]="from" [(to)]="to" />
      @if (hasFilters()) { <button type="button" class="btn btn-sm btn-link" (click)="clear()">Clear filters</button> }
    </div></div>
    @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }
    <div class="card"><div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead><tr>
          <th sortKey="createdAt" [(sort)]="sort">Received</th>
          @for (c of kind().columns; track c.key) { <th [sortKey]="c.sort!" [(sort)]="sort">{{ c.label }}</th> }
          <th sortKey="status" [(sort)]="sort">Status</th>
        </tr></thead>
        <tbody>
          @if (loading() && !result()) {
            <tr app-table-state [cols]="kind().columns.length + 2" [loading]="true"></tr>
          } @else {
            @for (r of result()?.data; track r['id']) {
              <tr class="cursor-pointer" (click)="open(r['id'])" (keydown.enter)="open(r['id'])" tabindex="0">
                <td class="text-nowrap">{{ r['createdAt'] | date: 'd MMM y, HH:mm' }}</td>
                @for (c of kind().columns; track c.key) {
                  <td>
                    @if (c.key === 'followUpOn') { {{ r[c.key] ? (r[c.key] | date: 'd MMM y') : '—' }} }
                    @else if ($first) { <a [routerLink]="[kind().base, r['id']]" class="fw-semibold" (click)="$event.stopPropagation()">{{ r[c.key] }}</a> }
                    @else { {{ r[c.key] ?? '—' }} }
                  </td>
                }
                <td><app-status [value]="r['status']" /></td>
              </tr>
            } @empty {
              <tr app-table-state [cols]="kind().columns.length + 2" [empty]="hasFilters() ? 'Nothing matches these filters.' : 'Nothing received yet.'"></tr>
            }
          }
        </tbody>
      </table>
    </div>
    @if (result(); as r) { <div class="card-footer bg-white"><app-pager [(page)]="page" [(pageSize)]="pageSize" [total]="r.meta.total" /></div> }
    </div>
  `,
})
export class SubmissionListPage {
  readonly type = input.required<string>();
  readonly embedded = input(false);
  private api = inject(AdminApi);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  readonly label = statusLabel;
  readonly kind = computed(() => KINDS[this.type()]);
  readonly qInput = signal('');
  readonly q = signal('');
  readonly status = signal('');
  readonly area = signal('');
  readonly job = signal('');
  readonly from = signal('');
  readonly to = signal('');
  readonly sort = signal<SortState | null>(null);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly loading = signal(true);
  readonly exporting = signal(false);
  readonly error = signal('');
  readonly result = signal<ListResult | null>(null);
  readonly areas = computed(() => (this.result()?.meta['areas'] as string[] | undefined) ?? []);
  readonly jobs = computed(() => (this.result()?.meta['jobs'] as { id: number; title: string }[] | undefined) ?? []);
  readonly hasFilters = computed(() => !!(this.q() || this.status() || this.area() || this.job() || this.from() || this.to()));
  private debounce?: ReturnType<typeof setTimeout>;

  private readonly filters = computed(() => cleanQuery({
    q: this.q(), status: this.status(), area: this.area(), job: this.job(), from: this.from(), to: this.to(), sort: this.sort()?.key, dir: this.sort()?.dir,
  }));

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.status.set(qp.get('status') ?? '');
    this.job.set(qp.get('job') ?? '');
    effect(() => {
      const query = { ...this.filters(), page: this.page(), pageSize: this.pageSize() };
      const k = this.kind();
      untracked(() => {
        this.loading.set(true);
        this.api.list(k.resource, query).subscribe({
          next: (r) => { this.result.set(r); this.loading.set(false); this.error.set(''); },
          error: (e) => { this.error.set(apiErrorMessage(e)); this.loading.set(false); },
        });
      });
    });
    effect(() => { this.filters(); this.pageSize(); untracked(() => this.page.set(1)); });
  }
  search(v: string) { this.qInput.set(v); clearTimeout(this.debounce); this.debounce = setTimeout(() => this.q.set(v.trim()), 300); }
  clear() { this.q.set(''); this.qInput.set(''); this.status.set(''); this.area.set(''); this.job.set(''); this.from.set(''); this.to.set(''); }
  open(id: number) { this.router.navigate([this.kind().base, id]); }

  exportCsv() {
    this.exporting.set(true);
    this.api.exportCsv(this.kind().resource, this.filters()).subscribe({
      next: (res) => { saveDownload(res, `${this.kind().resource}.csv`); this.exporting.set(false); this.toast.success('Export downloaded. Open it in Excel.'); },
      error: (e) => { this.exporting.set(false); this.toast.error(apiErrorMessage(e, 'The export failed.')); },
    });
  }
}

@Component({
  selector: 'app-submission-detail',
  imports: [FormsModule, DatePipe, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (item(); as r) {
      <app-page-header [title]="r['name']" [subtitle]="(r['organisation'] ?? r['position']) + ' · received ' + (r['createdAt'] | date: 'd MMM y, HH:mm')" [back]="{ label: kind().label, href: kind().base }">
        <app-status [value]="r['status']" />
        <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove()"><span class="icon me-1" aria-hidden="true">delete</span>Delete</button>
      </app-page-header>
      <div class="row g-3">
        <div class="col-lg-7"><div class="card"><div class="card-body">
          <h2 class="h6 mb-3">{{ kind().resource === 'enquiries' ? 'Enquiry details' : 'Applicant details' }}</h2>
          <dl class="row mb-0">
            @for (f of fields(r); track f.label) {
              <dt class="col-sm-4 text-muted fw-normal">{{ f.label }}</dt>
              <dd class="col-sm-8" style="white-space:pre-wrap">
                @if (f.href) { <a [href]="f.href" rel="noopener" target="_blank">{{ f.value }}</a> } @else { {{ f.value || '—' }} }
              </dd>
            }
          </dl>
          @if (r['cv']; as cv) {
            <hr />
            <h2 class="h6">Résumé</h2>
            <div class="d-flex flex-wrap align-items-center gap-2">
              <button type="button" class="btn btn-primary" (click)="downloadCv()" [disabled]="downloading()">
                <span class="icon me-1" aria-hidden="true">download</span>{{ downloading() ? 'Preparing…' : 'View / download résumé' }}
              </button>
              <span class="small text-muted">{{ cv.originalName }} · {{ (cv.sizeBytes / 1024).toFixed(0) }} KB</span>
            </div>
          }
        </div></div></div>
        <div class="col-lg-5"><div class="card"><div class="card-body">
          <h2 class="h6 mb-3">Follow-up</h2>
          <label class="form-label" for="status">Status</label>
          <select id="status" class="form-select mb-3" [(ngModel)]="status">
            @for (s of kind().statuses; track s) { <option [value]="s">{{ label(s) }}</option> }
          </select>
          @if (kind().resource === 'enquiries') {
            <label class="form-label" for="follow">Follow-up date</label>
            <input id="follow" type="date" class="form-control mb-3" [(ngModel)]="followUpOn" />
          }
          <label class="form-label" for="notes">Internal remarks</label>
          <textarea id="notes" class="form-control mb-1" rows="6" [(ngModel)]="notes" maxlength="4000" placeholder="Visible only in the Admin Panel"></textarea>
          <div class="form-text mb-3">{{ notes.length }} / 4000</div>
          <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
        </div></div></div>
      </div>
    } @else if (failed()) {
      <div class="alert alert-danger">{{ failed() }}</div>
    } @else {
      <div class="text-center py-5"><span class="spinner-border text-secondary"></span></div>
    }
  `,
})
export class SubmissionDetailPage {
  readonly type = input.required<string>();
  readonly id = input.required<string>();
  private api = inject(AdminApi);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  readonly label = statusLabel;
  readonly kind = computed(() => KINDS[this.type()]);
  readonly item = signal<Record<string, any> | null>(null);
  readonly saving = signal(false);
  readonly downloading = signal(false);
  readonly failed = signal('');
  status = '';
  notes = '';
  followUpOn = '';

  constructor() {
    effect(() => {
      const k = this.kind();
      const id = this.id();
      untracked(() => this.api.get(k.resource, id).subscribe({
        next: (r) => { this.item.set(r); this.status = r['status']; this.notes = r['notes'] ?? ''; this.followUpOn = r['followUpOn'] ?? ''; },
        error: (e) => this.failed.set(apiErrorMessage(e)),
      }));
    });
  }

  fields(r: Record<string, any>) {
    const mail = (v: string) => (v ? `mailto:${v}` : undefined);
    const tel = (v: string) => (v ? `tel:${v.replace(/[^+0-9]/g, '')}` : undefined);
    if (this.kind().resource === 'enquiries') {
      return [
        { label: 'Reference', value: `#${r['id']}` },
        { label: 'Email', value: r['email'], href: mail(r['email']) }, { label: 'Phone', value: r['phone'], href: tel(r['phone']) },
        { label: 'Organisation', value: r['organisation'] }, { label: 'Category', value: r['area'] }, { label: 'Message', value: r['message'] },
      ];
    }
    return [
      { label: 'Reference', value: `#${r['id']}` },
      { label: 'Position', value: r['position'] }, { label: 'Email', value: r['email'], href: mail(r['email']) }, { label: 'Phone', value: r['phone'], href: tel(r['phone']) },
      { label: 'Location', value: r['location'] }, { label: 'Qualification', value: r['qualification'] }, { label: 'Experience', value: `${r['experienceYears']} years` },
      { label: 'LinkedIn', value: r['linkedin'], href: r['linkedin'] || undefined }, { label: 'Message', value: r['message'] },
    ];
  }

  save() {
    this.saving.set(true);
    const body: Record<string, unknown> = { status: this.status, notes: this.notes };
    if (this.kind().resource === 'enquiries') body['followUpOn'] = this.followUpOn || null;
    this.api.patch(this.kind().resource, this.id(), body).subscribe({
      next: (r) => { this.item.set({ ...this.item(), ...r }); this.saving.set(false); this.toast.success('Saved.'); },
      error: (e) => { this.saving.set(false); this.toast.error(apiErrorMessage(e)); },
    });
  }

  async remove() {
    const k = this.kind();
    const ok = await this.confirm.ask({
      title: `Delete this ${k.singular}?`,
      message: k.resource === 'applications' ? 'The application and the applicant’s résumé will be deleted permanently.' : 'The enquiry will be deleted permanently.',
      confirmLabel: 'Delete', danger: true,
    });
    if (!ok) return;
    this.api.remove(k.resource, this.id()).subscribe({
      next: () => { this.toast.success('Deleted.'); this.router.navigateByUrl(k.base); },
      error: (e) => this.toast.error(apiErrorMessage(e)),
    });
  }

  downloadCv() {
    this.downloading.set(true);
    this.api.downloadCv(Number(this.id())).subscribe({
      next: (res) => { saveDownload(res, 'cv'); this.downloading.set(false); },
      error: (e) => { this.downloading.set(false); this.toast.error(apiErrorMessage(e, 'The résumé could not be downloaded.')); },
    });
  }
}
