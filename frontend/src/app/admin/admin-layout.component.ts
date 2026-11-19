import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './auth.service';
import { loadAdminAssets } from './login.page';
import { ConfirmHostComponent, ConfirmService, ToastHostComponent } from './ui';

interface NavEntry { label: string; sub: string; href: string; icon: string; exact?: boolean }

/** The Admin Panel menu, in order. */
export const ADMIN_NAV: NavEntry[] = [
  { label: 'Dashboard', sub: 'Website overview and analytics', href: '/admin', icon: 'dashboard', exact: true },
  { label: 'Career Management', sub: 'Job openings and applications', href: '/admin/careers', icon: 'work' },
  { label: 'Enquiry Management', sub: 'Website enquiries and follow-ups', href: '/admin/enquiries', icon: 'mail' },
  { label: 'Project Management', sub: 'Projects and project details', href: '/admin/projects', icon: 'apartment' },
  { label: 'Announcements & News', sub: 'Company news and announcements', href: '/admin/announcements', icon: 'campaign' },
  { label: 'Website Content Management', sub: 'Homepage, About Us, services and banners', href: '/admin/content', icon: 'web' },
  { label: 'Audit Log', sub: 'Admin activities and login history', href: '/admin/activity', icon: 'history' },
  { label: 'Website Settings', sub: 'Company information and social links', href: '/admin/settings', icon: 'settings' },
];

const COLLAPSE_KEY = 'spine-admin-sidebar-collapsed';
const WARN_BEFORE_MS = 2 * 60_000;

/** Admin shell: fixed, collapsible sidebar (slide-out on mobile), top bar with the admin profile, and page outlet. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent, ConfirmHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mousedown)': 'activity()', '(document:keydown)': 'activity()', '(document:touchstart)': 'activity()', '(document:scroll)': 'activity()',
    '(document:keydown.escape)': 'mobileOpen.set(false)',
  },
  template: `
    <a href="#admin-main" class="skip-link">Skip to content</a>
    <div class="admin-shell" [class.is-collapsed]="collapsed()" [class.is-mobile-open]="mobileOpen()">
      <aside class="admin-sidebar" id="admin-sidebar" aria-label="Admin Panel">
        <div class="sidebar-brand">
          <a routerLink="/admin" class="brand-link" (click)="mobileOpen.set(false)" title="Dashboard">
            <span class="brand-mark" aria-hidden="true">S</span>
            <span class="brand-text"><span class="brand-name">SPINE ADVISORY</span><span class="brand-sub">ADMIN PANEL</span></span>
          </a>
          <button type="button" class="sidebar-close d-lg-none" (click)="mobileOpen.set(false)" aria-label="Close menu"><span class="icon">close</span></button>
        </div>
        <nav class="sidebar-nav" aria-label="Admin modules">
          @for (n of nav; track n.href) {
            <a [routerLink]="n.href" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !!n.exact }" #rla="routerLinkActive"
               [attr.aria-current]="rla.isActive ? 'page' : null" [attr.title]="collapsed() ? n.label : null" (click)="mobileOpen.set(false)">
              <span class="icon nav-icon" aria-hidden="true">{{ n.icon }}</span>
              <span class="nav-text"><span class="nav-label">{{ n.label }}</span><span class="nav-sub">{{ n.sub }}</span></span>
            </a>
          }
        </nav>
        <div class="sidebar-foot">
          <a href="/" target="_blank" rel="noopener" [attr.title]="collapsed() ? 'View website' : null"><span class="icon nav-icon" aria-hidden="true">open_in_new</span><span class="nav-text"><span class="nav-label">View website</span></span></a>
          <button type="button" (click)="logout()" [attr.title]="collapsed() ? 'Logout' : null">
            <span class="icon nav-icon" aria-hidden="true">logout</span>
            <span class="nav-text"><span class="nav-label">Logout</span><span class="nav-sub">Ends the session</span></span>
          </button>
          <button type="button" class="collapse-toggle d-none d-lg-flex" (click)="toggleCollapsed()" [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'" [attr.aria-expanded]="!collapsed()" aria-controls="admin-sidebar">
            <span class="icon nav-icon" aria-hidden="true">{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</span><span class="nav-text"><span class="nav-label">Collapse</span></span>
          </button>
        </div>
      </aside>
      <div class="sidebar-backdrop d-lg-none" (click)="mobileOpen.set(false)" aria-hidden="true"></div>

      <div class="admin-body">
        <header class="admin-topbar">
          <button type="button" class="btn btn-sm btn-outline-secondary d-lg-none" (click)="mobileOpen.set(true)" aria-label="Open menu" aria-controls="admin-sidebar" [attr.aria-expanded]="mobileOpen()">
            <span class="icon" aria-hidden="true">menu</span>
          </button>
          <span class="topbar-title text-truncate">{{ section() }}</span>
          <div class="ms-auto d-flex align-items-center gap-2">
            <a routerLink="/admin/account" class="profile-chip" title="My account">
              <span class="avatar" aria-hidden="true">{{ initials() }}</span>
              <span class="d-none d-sm-flex flex-column lh-sm"><strong>{{ auth.user()?.name }}</strong><span class="small text-muted">{{ auth.user()?.username ?? 'Administrator' }}</span></span>
            </a>
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="logout()"><span class="icon me-1" aria-hidden="true">logout</span><span class="d-none d-sm-inline">Logout</span></button>
          </div>
        </header>
        @if (idleWarning()) {
          <div class="alert alert-warning rounded-0 border-0 border-bottom mb-0 d-flex flex-wrap align-items-center gap-2 py-2 px-3" role="alert">
            <span class="icon" aria-hidden="true">timer</span>
            You will be signed out soon because of inactivity.
            <button type="button" class="btn btn-sm btn-warning ms-auto" (click)="stayActive()">Stay signed in</button>
          </div>
        }
        <main id="admin-main" class="admin-main" tabindex="-1"><router-outlet /></main>
      </div>
    </div>
    <app-toast-host />
    <app-confirm-host />
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private confirm = inject(ConfirmService);
  readonly nav = ADMIN_NAV;
  readonly mobileOpen = signal(false);
  readonly collapsed = signal(false);
  readonly idleWarning = signal(false);
  readonly url = signal(this.router.url);
  readonly section = computed(() => {
    const u = this.url().split(/[?#]/)[0];
    if (u.startsWith('/admin/account')) return 'My account';
    return [...this.nav].reverse().find((n) => (n.exact ? u === n.href || u === n.href + '/' : u.startsWith(n.href)))?.label ?? 'Admin Panel';
  });
  readonly initials = computed(() => (this.auth.user()?.name ?? 'A').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase());
  private lastActivity = Date.now();
  private lastPing = Date.now();

  constructor() {
    const doc = inject(DOCUMENT);
    loadAdminAssets(doc, 'Admin Panel | Spine Advisory');
    try { this.collapsed.set(localStorage.getItem(COLLAPSE_KEY) === '1'); } catch { /* storage unavailable */ }
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      this.url.set(this.router.url);
      this.mobileOpen.set(false);
      doc.getElementById('admin-main')?.focus({ preventScroll: true });
    });
    // Automatic sign-out after inactivity (the server enforces the same limit).
    const timer = setInterval(() => this.checkIdle(), 15_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  activity() {
    this.lastActivity = Date.now();
    if (this.idleWarning()) this.idleWarning.set(false);
    // Keep the server session alive while the admin is working without saving (at most every 5 minutes).
    if (Date.now() - this.lastPing > 5 * 60_000) {
      this.lastPing = Date.now();
      this.auth.ping().subscribe({ error: () => undefined });
    }
  }

  stayActive() {
    this.idleWarning.set(false);
    this.lastActivity = this.lastPing = Date.now();
    this.auth.ping().subscribe({ error: () => undefined });
  }

  private checkIdle() {
    const idleMs = this.auth.idleMinutes() * 60_000;
    const quiet = Date.now() - this.lastActivity;
    if (quiet >= idleMs) {
      this.auth.logout().subscribe(() => this.router.navigate(['/admin/login'], { queryParams: { expired: 1, next: this.router.url } }));
    } else if (quiet >= idleMs - WARN_BEFORE_MS) {
      this.idleWarning.set(true);
    }
  }

  toggleCollapsed() {
    this.collapsed.update((c) => !c);
    try { localStorage.setItem(COLLAPSE_KEY, this.collapsed() ? '1' : '0'); } catch { /* storage unavailable */ }
  }

  async logout() {
    if (!(await this.confirm.ask({ title: 'Log out?', message: 'Your admin session will end.', confirmLabel: 'Logout' }))) return;
    this.auth.logout().subscribe(() => this.router.navigate(['/admin/login'], { queryParams: { signedOut: 1 } }));
  }
}
