import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../core/interceptors';
import { AdminApi, type Dashboard } from './admin-api.service';
import { AuthService } from './auth.service';
import { BarChartComponent } from './charts';
import { auditAction, auditModule } from './audit-labels';
import { ADMIN_UI } from './ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Website overview and analytics. Every figure is read live from the database. */
@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, BarChartComponent, ...ADMIN_UI],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'Welcome, ' + (auth.user()?.name ?? 'Admin')" subtitle="Website overview and analytics. Figures are live from the database.">
      <button type="button" class="btn btn-sm btn-outline-secondary" (click)="load()" [disabled]="loading()"><span class="icon me-1" aria-hidden="true">refresh</span>Refresh</button>
    </app-page-header>
    @if (data(); as d) {
      <div class="row g-3 mb-3">
        @for (t of cards(d); track t.label) {
          <div class="col-6 col-xl-3">
            <a [routerLink]="t.href" class="card stat-card h-100 text-decoration-none">
              <div class="card-body d-flex gap-3 align-items-start">
                <span class="stat-icon" [class]="'tone-' + t.tone"><span class="icon" aria-hidden="true">{{ t.icon }}</span></span>
                <div class="min-w-0">
                  <div class="text-muted small">{{ t.label }}</div>
                  <div class="fs-3 fw-bold text-body lh-sm">{{ t.value | number }}</div>
                  <div class="small text-muted">{{ t.note }}</div>
                </div>
              </div>
            </a>
          </div>
        }
      </div>

      <div class="card mb-3"><div class="card-body py-2 d-flex flex-wrap gap-2 align-items-center key-stats">
        <span class="small text-muted me-1">Other key statistics:</span>
        @for (k of keyStats(d); track k.label) {
          <a [routerLink]="k.href" class="key-stat"><strong>{{ k.value | number }}</strong> {{ k.label }}</a>
        }
      </div></div>

      <div class="row g-3 mb-3">
        <div class="col-lg-6"><div class="card h-100"><div class="card-body">
          <div class="d-flex justify-content-between align-items-baseline mb-2"><h2 class="h6 mb-0">Monthly website visitors</h2><span class="small text-muted">last 12 months · unique per day</span></div>
          <app-bar-chart [data]="visitorBars(d)" color="#1b3a6b" ariaLabel="Monthly website visitors, last 12 months" />
        </div></div></div>
        <div class="col-lg-6"><div class="card h-100"><div class="card-body">
          <div class="d-flex justify-content-between align-items-baseline mb-2"><h2 class="h6 mb-0">Monthly enquiries</h2><span class="small text-muted">last 12 months</span></div>
          <app-bar-chart [data]="enquiryBars(d)" color="#c98a12" ariaLabel="Monthly enquiries, last 12 months" />
        </div></div></div>
      </div>

      <div class="row g-3">
        <div class="col-lg-4"><div class="card h-100">
          <div class="card-header bg-white d-flex justify-content-between"><strong>Project status overview</strong><a routerLink="/admin/projects" class="small">Projects</a></div>
          <div class="card-body">
            @for (s of projectStatus(d); track s.key) {
              <div class="mb-3">
                <div class="d-flex justify-content-between small mb-1"><a [routerLink]="'/admin/projects'" [queryParams]="{ status: s.key }" class="text-body">{{ s.label }}</a><span class="fw-semibold">{{ s.count }}</span></div>
                <div class="progress" style="height:8px" role="progressbar" [attr.aria-label]="s.label" [attr.aria-valuenow]="s.count" aria-valuemin="0" [attr.aria-valuemax]="d.stats.projectsTotal">
                  <div class="progress-bar" [style.width.%]="s.pct" [style.background]="s.color"></div>
                </div>
              </div>
            }
            <p class="small text-muted mb-0">{{ d.stats.projectsTotal }} projects in total · {{ d.stats.publishedProjects }} published on the website</p>
          </div>
        </div></div>
        <div class="col-lg-4"><div class="card h-100">
          <div class="card-header bg-white d-flex justify-content-between"><strong>Recent admin activity</strong><a routerLink="/admin/activity" class="small">Audit log</a></div>
          <ul class="list-group list-group-flush">
            @for (a of d.recentActivity; track a.id) {
              <li class="list-group-item small">
                <div class="d-flex justify-content-between gap-2"><span class="fw-semibold">{{ action(a.action) }} · {{ module(a.entity) }}</span><span class="text-muted text-nowrap">{{ a.createdAt | date: 'd MMM, HH:mm' }}</span></div>
                @if (a.summary) { <div class="text-muted text-truncate">{{ a.summary }}</div> }
              </li>
            } @empty { <li class="list-group-item text-muted small">No activity yet.</li> }
          </ul>
        </div></div>
        <div class="col-lg-4 d-flex flex-column gap-3">
          <div class="card">
            <div class="card-header bg-white d-flex justify-content-between"><strong>Latest enquiries</strong><a routerLink="/admin/enquiries" class="small">All</a></div>
            <ul class="list-group list-group-flush">
              @for (e of d.recentEnquiries; track e.id) {
                <a class="list-group-item list-group-item-action d-flex justify-content-between gap-2 small" [routerLink]="['/admin/enquiries', e.id]">
                  <span class="text-truncate">{{ e.name }} <span class="text-muted">· {{ e.organisation }}</span></span>
                  <app-status [value]="e.status" />
                </a>
              } @empty { <li class="list-group-item text-muted small">No enquiries yet.</li> }
            </ul>
          </div>
          <div class="card">
            <div class="card-header bg-white"><strong>Most viewed pages</strong> <span class="small text-muted">· 30 days</span></div>
            <ul class="list-group list-group-flush">
              @for (pg of d.topPages; track pg.path) {
                <li class="list-group-item d-flex justify-content-between small"><a [href]="pg.path" target="_blank" rel="noopener" class="text-truncate">{{ pg.path }}</a><span class="text-muted">{{ pg.views | number }}</span></li>
              } @empty { <li class="list-group-item text-muted small">No visits recorded yet.</li> }
            </ul>
          </div>
        </div>
      </div>
    } @else if (error()) {
      <div class="alert alert-danger">{{ error() }} <button type="button" class="btn btn-sm btn-link" (click)="load()">Try again</button></div>
    } @else {
      <div class="text-center py-5"><span class="spinner-border text-secondary"></span></div>
    }
  `,
})
export class AdminDashboardPage {
  readonly auth = inject(AuthService);
  private api = inject(AdminApi);
  readonly data = signal<Dashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly action = auditAction;
  readonly module = auditModule;

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.dashboard().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); this.error.set(''); },
      error: (e) => { this.loading.set(false); this.error.set(apiErrorMessage(e, 'The dashboard could not be loaded.')); },
    });
  }

  cards(d: Dashboard) {
    const s = d.stats;
    return [
      { label: 'Total website visitors', value: s.visitors, note: `${s.visitorsThisMonth.toLocaleString('en-IN')} this month · ${s.pageViews.toLocaleString('en-IN')} page views`, icon: 'groups', tone: 'navy', href: '/admin' },
      { label: 'Total enquiries received', value: s.enquiries, note: `${s.enquiriesNew} new · ${s.enquiriesThisMonth} this month`, icon: 'mail', tone: 'amber', href: '/admin/enquiries' },
      { label: 'Active projects', value: s.activeProjects, note: `ongoing · ${s.projectsTotal} projects in total`, icon: 'apartment', tone: 'green', href: '/admin/projects' },
      { label: 'Published announcements', value: s.publishedAnnouncements, note: s.scheduledAnnouncements ? `${s.scheduledAnnouncements} scheduled` : 'visible on the website', icon: 'campaign', tone: 'blue', href: '/admin/announcements' },
    ];
  }

  keyStats(d: Dashboard) {
    const s = d.stats;
    return [
      { label: 'open job positions', value: s.jobsOpen, href: '/admin/careers/openings' },
      { label: `applications pending review (of ${s.applicationsTotal})`, value: s.applicationsPending, href: '/admin/careers/applications' },
      { label: 'new enquiries', value: s.enquiriesNew, href: '/admin/enquiries' },
      { label: 'projects published', value: s.publishedProjects, href: '/admin/projects' },
      { label: 'announcements scheduled', value: s.scheduledAnnouncements, href: '/admin/announcements' },
      { label: 'page views', value: s.pageViews, href: '/admin' },
    ];
  }

  private monthLabel = (m: string) => {
    const [y, mm] = m.split('-').map(Number);
    return { short: MONTHS[mm - 1], long: `${MONTHS[mm - 1]} ${y}` };
  };
  visitorBars = (d: Dashboard) => d.monthly.map((m) => ({ label: this.monthLabel(m.month).short, title: this.monthLabel(m.month).long, value: m.visitors }));
  enquiryBars = (d: Dashboard) => d.monthly.map((m) => ({ label: this.monthLabel(m.month).short, title: this.monthLabel(m.month).long, value: m.enquiries }));

  projectStatus(d: Dashboard) {
    const total = Math.max(1, d.stats.projectsTotal);
    return [
      { key: 'upcoming', label: 'Upcoming', color: '#3b82c4' },
      { key: 'ongoing', label: 'Ongoing', color: '#1e8a4c' },
      { key: 'completed', label: 'Completed', color: '#1b3a6b' },
      { key: 'on_hold', label: 'On hold', color: '#9aa3b2' },
    ].map((x) => ({ ...x, count: d.projectStatus[x.key as keyof Dashboard['projectStatus']] ?? 0, pct: ((d.projectStatus[x.key as keyof Dashboard['projectStatus']] ?? 0) / total) * 100 }));
  }
}
