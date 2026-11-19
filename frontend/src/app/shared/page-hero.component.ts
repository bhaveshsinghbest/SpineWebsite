import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isBanner } from '../core/banners';
import type { Crumb, Heading } from '../core/models';
import { BannerImageComponent } from './banner-image.component';
import { IconComponent } from './icon.component';

/** Inner-page banner: photograph under a navy overlay (or the navy dot grid) plus the breadcrumb trail. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink, IconComponent, BannerImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="position-relative overflow-hidden navy-field text-white">
      @if (hasBanner()) {
        <img [banner]="banner()!" priority sizes="100vw" [widths]="[720, 1024, 1408]" class="hero-bg" />
        <div class="hero-shade"></div>
      }
      <div class="wrap position-relative pb-16 pt-10 pb-lg-20 pt-lg-12">
        <nav aria-label="Breadcrumb" class="mb-10">
          <ol class="d-flex flex-wrap align-items-center gap-1 fs-small text-periwinkle">
            @for (c of crumbs(); track c.href; let i = $index; let last = $last) {
              <li class="d-flex align-items-center gap-1">
                @if (i > 0) { <span icon="chevron_right" [size]="16" class="text-periwinkle-60"></span> }
                @if (!last) { <a [routerLink]="c.href" class="hover-white">{{ c.name }}</a> }
                @else { <span aria-current="page" class="text-white">{{ c.name }}</span> }
              </li>
            }
          </ol>
        </nav>
        <div class="mw-3xl stack-5">
          <p class="eyebrow d-flex align-items-center gap-2 text-amber-soft"><span class="eyebrow-rule"></span>{{ shownEyebrow() }}</p>
          <h1 class="display-title">{{ shownTitle() }}</h1>
          @if (shownLead()) { <p class="fs-lead text-periwinkle">{{ shownLead() }}</p> }
          <ng-content />
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .hero-shade { position: absolute; inset: 0; background: linear-gradient(to right, var(--c-navy), rgb(10 25 47 / 0.9), rgb(10 25 47 / 0.45)); }
    .eyebrow-rule { display: inline-block; height: 1px; width: 2rem; background: var(--c-amber-soft); }
  `,
})
export class PageHeroComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input<string | undefined>();
  readonly banner = input<string | undefined>();
  readonly crumbs = input.required<Crumb[]>();
  /** Heading edited in the Admin Panel (Website Content Management → Page headings); empty fields keep the page's own wording. */
  readonly content = input<Heading | undefined>();
  readonly hasBanner = computed(() => isBanner(this.banner()));
  readonly shownEyebrow = computed(() => this.content()?.eyebrow || this.eyebrow());
  readonly shownTitle = computed(() => this.content()?.title || this.title());
  readonly shownLead = computed(() => this.content()?.lead || this.lead());
}
