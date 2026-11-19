// Reusable Admin Panel building blocks: toasts, confirmation dialogs, pagination, sortable headers,
// page headers, status badges, date-range filters and file downloads.
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Injectable, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// ---------- Toasts (success messages and error notifications) ----------
export interface Toast { id: number; kind: 'success' | 'error' | 'info'; text: string }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private next = 1;
  readonly toasts = signal<Toast[]>([]);
  success(text: string) { this.push('success', text); }
  error(text: string) { this.push('error', text, 7000); }
  info(text: string) { this.push('info', text); }
  dismiss(id: number) { this.toasts.update((t) => t.filter((x) => x.id !== id)); }
  private push(kind: Toast['kind'], text: string, ms = 4000) {
    const id = this.next++;
    this.toasts.update((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast-item" [class]="'toast-' + t.kind" role="status">
          <span class="icon" aria-hidden="true">{{ t.kind === 'success' ? 'check_circle' : t.kind === 'error' ? 'error' : 'info' }}</span>
          <span class="flex-grow-1">{{ t.text }}</span>
          <button type="button" class="btn-close btn-close-sm" aria-label="Dismiss" (click)="toasts.dismiss(t.id)"></button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  constructor(readonly toasts: ToastService) {}
}

// ---------- Confirmation dialog ----------
export interface ConfirmOptions { title: string; message: string; confirmLabel?: string; danger?: boolean }
interface PendingConfirm extends ConfirmOptions { resolve: (ok: boolean) => void }

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pending = signal<PendingConfirm | null>(null);
  /** Opens a modal dialog; resolves true when the user confirms. */
  ask(opts: ConfirmOptions): Promise<boolean> {
    this.pending()?.resolve(false);
    return new Promise((resolve) => this.pending.set({ ...opts, resolve }));
  }
  close(ok: boolean) {
    const p = this.pending();
    this.pending.set(null);
    p?.resolve(ok);
  }
}

@Component({
  selector: 'app-confirm-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'confirm.pending() && confirm.close(false)' },
  template: `
    @if (confirm.pending(); as c) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="confirm-title" (click)="backdrop($event)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h2 class="modal-title h5" id="confirm-title">{{ c.title }}</h2></div>
            <div class="modal-body"><p class="mb-0" style="white-space:pre-line">{{ c.message }}</p></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="confirm.close(false)">Cancel</button>
              <button type="button" class="btn" [class.btn-danger]="c.danger" [class.btn-primary]="!c.danger" (click)="confirm.close(true)" autofocus>{{ c.confirmLabel ?? 'Confirm' }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmHostComponent {
  constructor(readonly confirm: ConfirmService) {}
  backdrop(e: MouseEvent) { if (e.target === e.currentTarget) this.confirm.close(false); }
}

// ---------- Page header ----------
@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (back(); as b) { <nav class="small mb-2"><a [routerLink]="b.href" class="text-decoration-none">← {{ b.label }}</a></nav> }
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
      <div class="min-w-0">
        <h1 class="h4 mb-1">{{ title() }}</h1>
        @if (subtitle()) { <p class="text-muted mb-0">{{ subtitle() }}</p> }
      </div>
      <div class="d-flex flex-wrap gap-2"><ng-content /></div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly back = input<{ label: string; href: string } | null>(null);
}

// ---------- Status badge ----------
const BADGE: Record<string, string> = {
  published: 'success', open: 'success', ongoing: 'success', resolved: 'success', selected: 'success',
  draft: 'warning', pending: 'warning', new: 'primary', in_progress: 'info', upcoming: 'info', shortlisted: 'info', scheduled: 'info',
  closed: 'secondary', archived: 'secondary', completed: 'dark', on_hold: 'secondary', rejected: 'danger',
};
export const statusLabel = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '—');

@Component({
  selector: 'app-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge badge-status" [class]="'text-bg-' + tone()">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  readonly value = input.required<string | null | undefined>();
  readonly tone = computed(() => BADGE[this.value() ?? ''] ?? 'light');
  readonly label = computed(() => statusLabel(this.value()));
}

// ---------- Pagination ----------
@Component({
  selector: 'app-pager',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <span class="small text-muted">
        @if (total() > 0) { {{ first() }}–{{ last() }} of {{ total() }} } @else { No results }
      </span>
      <div class="d-flex align-items-center gap-2">
        <select class="form-select form-select-sm w-auto" [ngModel]="pageSize()" (ngModelChange)="pageSize.set(+$event); page.set(1)" aria-label="Rows per page">
          @for (n of sizes; track n) { <option [value]="n">{{ n }} / page</option> }
        </select>
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="page() <= 1" (click)="page.set(page() - 1)" aria-label="Previous page">‹</button>
          <span class="btn btn-sm btn-outline-secondary disabled">{{ page() }} / {{ pages() }}</span>
          <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="page() >= pages()" (click)="page.set(page() + 1)" aria-label="Next page">›</button>
        </div>
      </div>
    </div>
  `,
})
export class PagerComponent {
  readonly page = model.required<number>();
  readonly pageSize = model.required<number>();
  readonly total = input.required<number>();
  readonly sizes = [10, 20, 50, 100];
  readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly first = computed(() => (this.page() - 1) * this.pageSize() + 1);
  readonly last = computed(() => Math.min(this.total(), this.page() * this.pageSize()));
}

// ---------- Sortable column header ----------
export interface SortState { key: string; dir: 'asc' | 'desc' }

@Component({
  selector: 'th[sortKey]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-sort]': 'ariaSort()', class: 'sortable' },
  template: `
    <button type="button" class="sort-btn" (click)="toggle()">
      <ng-content /><span class="icon sort-icon" aria-hidden="true">{{ active() ? (sort()?.dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}</span>
    </button>
  `,
})
export class SortHeaderComponent {
  readonly sortKey = input.required<string>();
  readonly sort = model<SortState | null>(null);
  readonly sorted = output<SortState>();
  readonly active = computed(() => this.sort()?.key === this.sortKey());
  readonly ariaSort = computed(() => (this.active() ? (this.sort()!.dir === 'asc' ? 'ascending' : 'descending') : null));
  toggle() {
    const next: SortState = { key: this.sortKey(), dir: this.active() && this.sort()!.dir === 'desc' ? 'asc' : 'desc' };
    this.sort.set(next);
    this.sorted.emit(next);
  }
}

// ---------- Date range filter ----------
@Component({
  selector: 'app-date-range',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="d-flex align-items-center gap-1 date-range">
      <input type="date" class="form-control" [ngModel]="from()" (ngModelChange)="from.set($event || '')" [attr.aria-label]="label() + ' from'" [max]="to() || null" />
      <span class="text-muted small">to</span>
      <input type="date" class="form-control" [ngModel]="to()" (ngModelChange)="to.set($event || '')" [attr.aria-label]="label() + ' to'" [min]="from() || null" />
    </div>
  `,
})
export class DateRangeComponent {
  readonly from = model('');
  readonly to = model('');
  readonly label = input('Date');
}

// ---------- Empty / loading table rows ----------
@Component({
  selector: 'tr[app-table-state]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <td [attr.colspan]="cols()" class="text-center py-5 text-muted">
      @if (loading()) { <span class="spinner-border spinner-border-sm text-secondary me-2"></span>Loading… } @else { {{ empty() }} }
    </td>
  `,
})
export class TableStateComponent {
  readonly cols = input.required<number>();
  readonly loading = input(false);
  readonly empty = input('Nothing found.');
}

/** Saves a downloaded file (blob response) using the server's file name. */
export function saveDownload(res: HttpResponse<Blob>, fallback = 'download') {
  const name = /filename="?([^";]+)"?/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? fallback;
  const url = URL.createObjectURL(res.body!);
  const a = document.createElement('a');
  a.href = url;
  a.download = decodeURIComponent(name);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Query-string object without empty values. */
export const cleanQuery = (q: Record<string, string | number | undefined | null>) =>
  Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== null && v !== '')) as Record<string, string | number>;

export const ADMIN_UI = [PageHeaderComponent, StatusBadgeComponent, PagerComponent, SortHeaderComponent, DateRangeComponent, TableStateComponent];
