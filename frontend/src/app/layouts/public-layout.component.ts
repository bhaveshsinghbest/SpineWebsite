import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { iconFontUrl } from '../core/icons';
import type { Loaded } from '../core/page-data';
import { ErrorStateComponent } from '../shared/page-base';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

/** Public website shell: header, page, footer. Loads the icon font subset for the icons in use. */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a href="#main" class="skip-link">Skip to content</a>
    @if (navigating()) { <div class="route-progress" role="progressbar" aria-label="Loading page"></div> }
    @if (site(); as s) {
      <app-header [site]="s" />
      <main id="main" class="main"><router-outlet /></main>
      <app-footer [site]="s" />
    } @else {
      <main id="main"><app-error-state message="The website is temporarily unavailable." /></main>
    }
  `,
  styles: `.main { display: block; padding-top: var(--header-h); }`,
})
export class PublicLayoutComponent {
  readonly page = input.required<Loaded<null>>();
  readonly site = computed(() => {
    const p = this.page();
    return p.status === 'ok' ? p.site : null;
  });
  private router = inject(Router);
  private doc = inject(DOCUMENT);
  readonly navigating = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationStart || e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError),
      map((e) => e instanceof NavigationStart),
    ),
    { initialValue: false },
  );

  constructor() {
    // Anonymous page-view statistics for the Admin Panel dashboard (browser only; no cookies are set).
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      let first = true;
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
        const path = e.urlAfterRedirects.split(/[?#]/)[0] || '/';
        const body = JSON.stringify({ path, referrer: first ? this.doc.referrer || undefined : undefined });
        first = false;
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
      });
    }
    effect(() => {
      const s = this.site();
      const href = iconFontUrl(s?.icons ?? []);
      let link = this.doc.getElementById('icon-font') as HTMLLinkElement | null;
      if (!link) {
        link = this.doc.createElement('link');
        link.id = 'icon-font';
        link.rel = 'stylesheet';
        this.doc.head.appendChild(link);
      }
      if (link.getAttribute('href') !== href) link.setAttribute('href', href);
    });
  }
}
