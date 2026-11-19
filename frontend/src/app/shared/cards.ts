// Content cards: sector / industry / pillar, practice, article, testimonial.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isBanner } from '../core/banners';
import { formatDate } from '../core/format';
import type { Article, Practice, Sector, Testimonial } from '../core/models';
import { BannerImageComponent } from './banner-image.component';
import { IconComponent } from './icon.component';

const cardHost = `:host { display: flex; } :host > * { flex: 1 1 auto; min-width: 0; }`;

/** Sector or industry card (photo header) or strategic pillar card (`variant="pillar"`, amber top rule). */
@Component({
  selector: 'app-sector-card',
  imports: [RouterLink, IconComponent, BannerImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card card-interactive group d-flex flex-column overflow-hidden" [class.pillar]="variant() === 'pillar'">
      @if (variant() === 'sector') {
        @if (photo()) {
          <div class="media position-relative overflow-hidden">
            <img [banner]="item().banner!" [widths]="[480, 720]" sizes="(min-width:1024px) 400px, 100vw" class="media-img gh-zoom" />
            <div class="media-shade"></div>
            <span class="tag media-tag bg-navy-2 text-white">{{ item().tag }}</span>
          </div>
        } @else {
          <div class="media position-relative d-flex align-items-end navy-field p-5">
            <span class="tag media-tag bg-white-10 text-white">{{ item().tag }}</span>
            <span [icon]="item().icon" [size]="56" class="text-periwinkle-70"></span>
          </div>
        }
      }
      <div class="d-flex flex-1 flex-column p-6">
        @if (variant() === 'pillar') {
          <div class="mb-5 d-flex align-items-center justify-content-between">
            <span class="icon-tile pillar-tile bg-mist text-navy gh-bg-navy"><span [icon]="item().icon" [size]="24"></span></span>
            <span class="tag bg-mist text-muted">{{ item().tag }}</span>
          </div>
        }
        <h3 class="card-title"><a [routerLink]="href()" class="stretched">{{ item().title }}</a></h3>
        <p class="mt-2 flex-1 fs-small text-muted">{{ item().summary }}</p>
        <ul class="mt-4 stack-1h fs-small text-ink-2">
          @for (h of item().highlights.slice(0, 2); track h) {
            <li class="d-flex align-items-start gap-2"><span icon="check_circle" [size]="16" class="mt-0h text-cobalt"></span>{{ h }}</li>
          }
        </ul>
        <span class="mt-5 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-cobalt gh-gap-2">
          Explore framework <span icon="arrow_forward" [size]="16"></span>
        </span>
      </div>
    </article>
  `,
  styles: `${cardHost}
    .pillar { border-top: 3px solid var(--c-amber); }
    .media { height: 12rem; }
    .media-img { height: 100%; width: 100%; object-fit: cover; }
    .media-shade { position: absolute; inset: 0; background: rgb(10 25 47 / 0.35); }
    .media-tag { position: absolute; left: 1rem; top: 1rem; }
    .pillar-tile { width: 3rem; height: 3rem; }
  `,
})
export class SectorCardComponent {
  readonly item = input.required<{ title: string; summary: string; highlights: string[]; tag: string; icon: string; banner?: string }>();
  readonly href = input.required<string>();
  readonly variant = input<'sector' | 'pillar'>('sector');
  readonly photo = computed(() => isBanner(this.item().banner));
}

@Component({
  selector: 'app-practice-card',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card card-interactive group d-flex flex-column p-7">
      <span class="icon-tile bg-navy text-white"><span [icon]="practice().icon" [size]="22"></span></span>
      <h3 class="mt-5 card-title"><a [routerLink]="'/services/' + practice().slug" class="stretched">{{ practice().title }}</a></h3>
      <p class="mt-2 flex-1 fs-small text-muted">{{ practice().summary }}</p>
      <div class="mt-5 d-flex flex-wrap gap-1h">
        @for (t of practice().tags; track t) { <span class="tag tag-sm bg-mist text-ink-2">{{ t }}</span> }
      </div>
      <div class="mt-6 d-flex align-items-center justify-content-between border-top pt-4 fs-small">
        <span class="text-muted">{{ practice().items.length }} services</span>
        <span class="d-inline-flex align-items-center gap-1 fw-semibold text-cobalt gh-gap-2">View practice <span icon="arrow_forward" [size]="16"></span></span>
      </div>
    </article>
  `,
  styles: `${cardHost} .tag-sm { font-size: 10px; }`,
})
export class PracticeCardComponent {
  readonly practice = input.required<Pick<Practice, 'slug' | 'title' | 'icon' | 'summary' | 'tags' | 'items'>>();
}

@Component({
  selector: 'app-article-card',
  imports: [RouterLink, IconComponent, BannerImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card card-interactive group d-flex flex-column overflow-hidden">
      <div class="media position-relative overflow-hidden navy-field">
        @if (photo()) {
          <img [banner]="article().banner!" [widths]="[480, 720]" sizes="(min-width:768px) 420px, 100vw" class="media-img gh-zoom" />
        }
        <span class="tag media-tag bg-navy-2 text-white">{{ article().category }}</span>
      </div>
      <div class="d-flex flex-1 flex-column p-6">
        <p class="eyebrow text-muted"><time [attr.datetime]="article().published">{{ date() }}</time> · {{ article().readingMinutes }} min read</p>
        <h3 class="mt-3 card-title"><a [routerLink]="'/insights/' + article().slug" class="stretched">{{ article().title }}</a></h3>
        <p class="mt-2 flex-1 fs-small text-muted">{{ article().summary }}</p>
        <span class="mt-5 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-cobalt">Read the brief <span icon="north_east" [size]="16"></span></span>
      </div>
    </article>
  `,
  styles: `${cardHost}
    .media { height: 11rem; }
    .media-img { height: 100%; width: 100%; object-fit: cover; }
    .media-tag { position: absolute; left: 0.75rem; top: 0.75rem; }
  `,
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
  readonly photo = computed(() => isBanner(this.article().banner));
  readonly date = computed(() => formatDate(this.article().published));
}

@Component({
  selector: 'app-testimonial-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="card card-interactive position-relative d-flex h-100 flex-column p-7 m-0">
      <span icon="format_quote" [size]="36" class="text-amber"></span>
      <blockquote class="mt-3 flex-1 font-serif quote">{{ t().quote }}</blockquote>
      <figcaption class="mt-6 border-top pt-4">
        <span class="d-block fw-semibold text-ink">{{ t().name }}</span>
        <span class="fs-small text-muted">{{ t().designation }}, {{ t().organisation }}</span>
      </figcaption>
    </figure>
  `,
  styles: `${cardHost} .quote { font-size: 1.25rem; line-height: 1.375; color: var(--c-ink); margin: 0; }`,
})
export class TestimonialCardComponent {
  readonly t = input.required<Testimonial>();
}

export type { Sector };
