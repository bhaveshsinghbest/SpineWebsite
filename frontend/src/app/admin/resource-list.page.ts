import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../core/interceptors';
import { AdminApi, type ListResult } from './admin-api.service';
import { LookupService } from './lookups.service';
import { resourceByName, type QuickAction } from './resources';
import { ADMIN_UI, ConfirmService, ToastService, cleanQuery, type SortState } from './ui';

/** Generic list for any content type: search, filters, date range, sorting, pagination, quick status actions, delete. */
@Component({
  selector: 'app-resource-list',
  imports: [RouterLink, FormsModule, DatePipe, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cfg(); as c) {
      @if (!embedded()) {
        <app-page-header [title]="c.label" [subtitle]="c.description">
          <a class="btn btn-primary" [routerLink]="[base(), 'new']" [queryParams]="tab() ? { kind: tab() } : {}"><span class="icon me-1" aria-hidden="true">add</span>New {{ c.singular }}</a>
        </app-page-header>
      } @else {
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <p class="text-muted mb-0">{{ c.description }}</p>
          <a class="btn btn-primary" [routerLink]="[base(), 'new']" [queryParams]="tab() ? { kind: tab() } : {}"><span class="icon me-1" aria-hidden="true">add</span>New {{ c.singular }}</a>
        </div>
      }
      @if (c.tabs) {
        <ul class="nav nav-tabs mb-3">
          @for (t of c.tabs.options; track t.value) {
            <li class="nav-item"><button type="button" class="nav-link" [class.active]="tab() === t.value" (click)="setTab(String(t.value))">{{ t.label }}</button></li>
          }
        </ul>
      }
      <div class="card mb-3"><div class="card-body py-2 d-flex flex-wrap gap-2 align-items-center filter-bar">
        <div class="input-group search">
          <span class="input-group-text bg-white"><span class="icon" aria-hidden="true">search</span></span>
          <input type="search" class="form-control" placeholder="Search…" [ngModel]="qInput()" (ngModelChange)="search($event)" aria-label="Search" />
        </div>
        @if (c.statuses) {
          <select class="form-select w-auto" [ngModel]="filterValue('status')" (ngModelChange)="setFilter('status', $event)" aria-label="Filter by status">
            <option value="">All statuses</option>
            @for (s of c.statuses; track s.value) { <option [value]="s.value">{{ s.label }}</option> }
          </select>
        }
        @for (f of c.filters ?? []; track f.key) {
          <select class="form-select w-auto" [ngModel]="filterValue(f.key)" (ngModelChange)="setFilter(f.key, $event)" [attr.aria-label]="f.label">
            <option value="">{{ f.label }}</option>
            @for (o of f.options ?? lookups.options()[f.optionsFrom!] ?? []; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
          </select>
        }
        @if (c.dateFilter) {
          <span class="small text-muted ms-1">{{ c.dateFilter }}:</span>
          <app-date-range [label]="c.dateFilter" [(from)]="from" [(to)]="to" />
        }
        @if (hasFilters()) { <button type="button" class="btn btn-sm btn-link" (click)="clearFilters()">Clear filters</button> }
      </div></div>
      @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }
      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead><tr>
              @for (col of c.columns; track col.key) {
                @if (col.sort) { <th [sortKey]="col.sort" [(sort)]="sort">{{ col.label }}</th> } @else { <th>{{ col.label }}</th> }
              }
              <th class="text-end">Actions</th>
            </tr></thead>
            <tbody>
              @if (loading() && !result()) {
                <tr app-table-state [cols]="c.columns.length + 1" [loading]="true"></tr>
              } @else {
                @for (row of result()?.data; track row['id']) {
                  <tr [class.opacity-50]="busyId() === row['id']">
                    @for (col of c.columns; track col.key; let first = $first) {
                      @let v = col.value ? col.value(row) : row[col.key];
                      <td>
                        @switch (col.kind) {
                          @case ('status') { <app-status [value]="$any(v)" /> }
                          @case ('date') { <span class="text-nowrap">{{ v ? ($any(v) | date: 'd MMM y') : '—' }}</span> }
                          @case ('datetime') { <span class="text-nowrap">{{ v ? ($any(v) | date: 'd MMM y, HH:mm') : '—' }}</span> }
                          @case ('bool') { {{ v ? 'Yes' : '—' }} }
                          @case ('count') { <span class="badge text-bg-light border">{{ v ?? 0 }}</span> }
                          @default {
                            @if (first) { <a [routerLink]="[base(), row['id']]" class="fw-semibold">{{ v }}</a> }
                            @else { {{ v ?? '—' }} }
                          }
                        }
                      </td>
                    }
                    <td class="text-end text-nowrap">
                      @for (a of actionsFor(row); track a.status) {
                        <button type="button" class="btn btn-sm btn-light border btn-icon me-1" (click)="quick(row, a)" [disabled]="busyId() === row['id']" [title]="a.label" [attr.aria-label]="a.label">
                          <span class="icon" aria-hidden="true">{{ a.icon }}</span>
                        </button>
                      }
                      @for (l of c.rowLinks ?? []; track l.label) {
                        <a class="btn btn-sm btn-light border btn-icon me-1" [routerLink]="l.link(row).path" [queryParams]="l.link(row).query ?? {}" [title]="l.label" [attr.aria-label]="l.label"><span class="icon" aria-hidden="true">{{ l.icon }}</span></a>
                      }
                      @if (c.publicUrl?.(row); as url) { <a class="btn btn-sm btn-light border btn-icon me-1" [href]="url" target="_blank" rel="noopener" title="View on website" aria-label="View on website"><span class="icon" aria-hidden="true">open_in_new</span></a> }
                      <a class="btn btn-sm btn-light border btn-icon me-1" [routerLink]="[base(), row['id']]" title="Edit" aria-label="Edit"><span class="icon" aria-hidden="true">edit</span></a>
                      <button type="button" class="btn btn-sm btn-light border btn-icon text-danger" (click)="remove(row)" title="Delete" aria-label="Delete" [disabled]="busyId() === row['id']"><span class="icon" aria-hidden="true">delete</span></button>
                    </td>
                  </tr>
                } @empty {
                  <tr app-table-state [cols]="c.columns.length + 1" [empty]="hasFilters() ? 'Nothing matches these filters.' : 'Nothing here yet. Use “New ' + c.singular + '” to add one.'"></tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (result(); as r) {
          <div class="card-footer bg-white"><app-pager [(page)]="page" [(pageSize)]="pageSize" [total]="r.meta.total" /></div>
        }
      </div>
    } @else {
      <div class="alert alert-warning">Unknown content type.</div>
    }
  `,
})
export class ResourceListPage {
  readonly resource = input.required<string>();
  /** Base URL of this list (route data); defaults to the content-management path. */
  readonly basePath = input<string | undefined>(undefined, { alias: 'base' });
  /** True when shown inside a module page with its own heading and tabs. */
  readonly embedded = input(false);
  private api = inject(AdminApi);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  readonly lookups = inject(LookupService);
  readonly String = String;
  readonly cfg = computed(() => resourceByName(this.resource()));
  readonly base = computed(() => this.basePath() ?? `/admin/content/r/${this.resource()}`);

  readonly qInput = signal('');
  readonly q = signal('');
  readonly filters = signal<Record<string, string>>({});
  readonly from = signal('');
  readonly to = signal('');
  readonly tab = signal('');
  readonly sort = signal<SortState | null>(null);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly loading = signal(true);
  readonly busyId = signal<number | null>(null);
  readonly error = signal('');
  readonly result = signal<ListResult | null>(null);
  readonly hasFilters = computed(() => !!(this.q() || this.from() || this.to() || Object.values(this.filters()).some(Boolean)));
  private debounce?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const c = this.cfg();
      untracked(() => {
        // Filters can be pre-set from the URL (e.g. ?status=draft).
        const qp = this.route.snapshot.queryParamMap;
        const keys = [...(c?.statuses ? ['status'] : []), ...(c?.filters ?? []).map((f) => f.key)];
        this.filters.set(Object.fromEntries(keys.filter((k) => qp.get(k)).map((k) => [k, qp.get(k)!])));
        this.tab.set(c?.tabs ? String(c.tabs.options[0].value) : '');
        this.q.set('');
        this.qInput.set('');
        this.from.set('');
        this.to.set('');
        this.sort.set(null);
        this.page.set(1);
        const needed = (c?.filters ?? []).map((f) => f.optionsFrom).filter((k) => !!k);
        if (needed.length) this.lookups.load(needed as never[]);
      });
    });
    effect(() => {
      const c = this.cfg();
      if (!c) return;
      const query = this.query();
      untracked(() => this.load(c.name, query));
    });
    // Back to page 1 whenever the filters change.
    effect(() => { this.q(); this.filters(); this.from(); this.to(); this.tab(); this.sort(); this.pageSize(); untracked(() => this.page.set(1)); });
  }

  private readonly query = computed(() => {
    const c = this.cfg();
    return cleanQuery({
      q: this.q(), ...this.filters(), from: this.from(), to: this.to(), page: this.page(), pageSize: this.pageSize(),
      sort: this.sort()?.key, dir: this.sort()?.dir, ...(c?.tabs ? { [c.tabs.key]: this.tab() } : {}),
    });
  });

  private load(name: string, query: Record<string, string | number>) {
    this.loading.set(true);
    this.api.list(name, query).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); this.error.set(''); },
      error: (e) => { this.loading.set(false); this.error.set(apiErrorMessage(e)); },
    });
  }
  private reload() { const c = this.cfg(); if (c) this.load(c.name, this.query()); }

  filterValue = (key: string) => this.filters()[key] ?? '';
  setFilter(key: string, value: string) { this.filters.update((f) => ({ ...f, [key]: value })); }
  clearFilters() { this.filters.set({}); this.q.set(''); this.qInput.set(''); this.from.set(''); this.to.set(''); }
  search(v: string) {
    this.qInput.set(v);
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.q.set(v.trim()), 300);
  }
  setTab(v: string) { this.tab.set(v); }
  actionsFor = (row: Record<string, any>) => (this.cfg()?.quickActions ?? []).filter((a) => a.when(row));
  private label = (row: Record<string, any>) => row['title'] ?? row['name'] ?? row['city'] ?? row['fromPath'] ?? `#${row['id']}`;

  async quick(row: Record<string, any>, a: QuickAction) {
    const c = this.cfg()!;
    if (a.confirm && !(await this.confirm.ask({ title: `${a.label} “${this.label(row)}”?`, message: a.confirm, confirmLabel: a.label, danger: a.danger }))) return;
    this.busyId.set(row['id']);
    this.api.setStatus(c.name, row['id'], a.status).subscribe({
      next: () => {
        this.busyId.set(null);
        const done = a.label.toLowerCase().endsWith('e') ? `${a.label}d` : `${a.label}ed`;
        this.toast.success(`${done}: “${this.label(row)}”.`);
        if (c.invalidates) this.lookups.invalidate(...c.invalidates);
        this.reload();
      },
      error: (e) => { this.busyId.set(null); this.toast.error(apiErrorMessage(e)); },
    });
  }

  async remove(row: Record<string, any>) {
    const c = this.cfg()!;
    const ok = await this.confirm.ask({ title: `Delete ${c.singular}?`, message: `“${this.label(row)}” will be deleted permanently. This cannot be undone.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    this.busyId.set(row['id']);
    this.api.remove(c.name, row['id']).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`Deleted “${this.label(row)}”.`);
        if (c.invalidates) this.lookups.invalidate(...c.invalidates);
        this.reload();
      },
      error: (e) => { this.busyId.set(null); this.toast.error(apiErrorMessage(e)); },
    });
  }
}
