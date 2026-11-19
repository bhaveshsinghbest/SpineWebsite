import { ChangeDetectionStrategy, Component, Directive, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Loaded } from '../core/page-data';
import type { Site } from '../core/models';
import { SeoService, type PageSeo } from '../core/seo.service';
import { IconComponent } from './icon.component';

/** Base for routed pages: receives resolved data, applies SEO, and exposes the ready state. */
@Directive()
export abstract class PageBase<T> {
  /** Bound from the route's `page` resolver. */
  readonly page = input.required<Loaded<T>>();
  readonly ok = computed(() => {
    const p = this.page();
    return p.status === 'ok' ? p : null;
  });
  protected readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const p = this.page();
      untracked(() => {
        if (p.status === 'ok') this.seo.set(p.site, this.meta(p.site, p.data));
        else if (p.status === 'not-found') {
          if (p.site) this.seo.set(p.site, NOT_FOUND_SEO);
          this.seo.notFound();
        }
      });
    });
  }

  protected abstract meta(site: Site, data: T): PageSeo;
}

export const NOT_FOUND_SEO: PageSeo = { title: 'Page not found', description: 'The page you are looking for could not be found.', noindex: true };

/** 404 content, used by the catch-all route and by pages whose item does not exist. */
@Component({
  selector: 'app-not-found-content',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="navy-field py-28 text-white">
      <div class="wrap mw-2xl text-center">
        <p class="eyebrow text-amber-soft">Error 404</p>
        <h1 class="mt-3 font-serif fs-h1 fw-semibold">This page could not be found</h1>
        <p class="mt-4 text-periwinkle">The page may have moved as part of our new website. Try one of these instead:</p>
        <div class="mt-8 d-flex flex-wrap justify-content-center gap-3">
          <a routerLink="/" class="btn btn-light">Home</a>
          <a routerLink="/services" class="btn btn-ghost-dark">Services</a>
          <a routerLink="/industries" class="btn btn-ghost-dark">Industries</a>
          <a routerLink="/about" class="btn btn-ghost-dark">About Us</a>
          <a routerLink="/contact" class="btn btn-amber"><span icon="call" [size]="18"></span> Contact</a>
        </div>
      </div>
    </section>
  `,
  styles: `:host { display: block; } .py-28 { padding-block: 7rem; }`,
})
export class NotFoundContentComponent {}

/** Shown when a page's data could not be loaded (API unavailable). */
@Component({
  selector: 'app-error-state',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-20">
      <div class="wrap">
        <div class="card mx-auto mw-2xl p-8 text-center" role="alert">
          <span class="icon-tile square-14 mx-auto bg-mist text-cobalt"><span icon="error" [size]="28"></span></span>
          <h1 class="mt-6 serif-h2">We could not load this page</h1>
          <p class="mx-auto mt-3 mw-xl text-muted">{{ message() }} Please try again in a moment. If the problem continues, email us and we will help directly.</p>
          <button type="button" class="btn btn-primary mt-8" (click)="reload()"><span icon="refresh" [size]="18"></span> Try again</button>
        </div>
      </div>
    </section>
  `,
  styles: `:host { display: block; }`,
})
export class ErrorStateComponent {
  readonly message = input('This page could not be loaded right now.');
  reload() { location.reload(); }
}

/** Renders the not-found or error state for a page that is not ready. */
@Component({
  selector: 'app-page-fallback',
  imports: [NotFoundContentComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (page().status) {
      @case ('not-found') { <app-not-found-content /> }
      @case ('error') { <app-error-state /> }
    }
  `,
})
export class PageFallbackComponent {
  readonly page = input.required<Loaded<unknown>>();
}
