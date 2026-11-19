import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/format';
import type { Announcement, Paged, Site } from '../../core/models';
import { abs, breadcrumbs } from '../../core/schema';
import { AnnouncementCardComponent } from '../../shared/content-cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { CtaBandComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, AnnouncementCardComponent, CtaBandComponent, PageFallbackComponent, ...MOTION];

/** /news: published announcements and news (scheduled items appear when due). Managed in Admin Panel → Announcements & News. */
@Component({
  selector: 'app-news-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Newsroom" title="Announcements & News" [content]="p.site.pages?.['news']"
        lead="Company announcements, appointments and news from Spine Advisory." banner="port-dusk" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap">
          @if (p.data.data.length) {
            <div class="grid gap-8" revealGroup>
              @for (a of p.data.data; track a.slug) { <app-announcement-card [item]="a" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
            </div>
          } @else {
            <div class="card mx-auto mw-2xl p-8 text-center">
              <h2 class="serif-h2">No announcements yet</h2>
              <p class="mt-3 text-muted">Company news will appear here. For our policy research, see <a routerLink="/insights" class="text-cobalt fw-semibold">Insights</a>.</p>
            </div>
          }
          @if (p.data.meta.pages > 1) {
            <nav class="mt-12 d-flex justify-content-center gap-2" aria-label="News pages">
              @for (n of pages(); track n) {
                <a [routerLink]="[]" [queryParams]="{ page: n === 1 ? null : n }" class="btn btn-compact" [class.btn-primary]="n === p.data.meta.page" [class.btn-outline]="n !== p.data.meta.page"
                   [attr.aria-current]="n === p.data.meta.page ? 'page' : null">{{ n }}</a>
              }
            </nav>
          }
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `:host { display: block; }`,
})
export class NewsPage extends PageBase<Paged<Announcement>> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'News', href: '/news/' }];
  readonly pages = computed(() => Array.from({ length: this.ok()?.data.meta.pages ?? 1 }, (_, i) => i + 1));
  protected meta(site: Site, d: Paged<Announcement>) {
    return {
      title: site.pages?.['news']?.title || 'Announcements & News',
      description: 'Company announcements and news from Spine Advisory, the Indian infrastructure and transaction advisory firm.',
      schema: [
        breadcrumbs(this.crumbs),
        { '@type': 'CollectionPage', name: 'Announcements & News', hasPart: d.data.map((a) => ({ '@type': 'NewsArticle', headline: a.title, url: abs(`/news/${a.slug}/`), datePublished: a.publishedAt })) },
      ],
    };
  }
}

export interface NewsItemData { item: Announcement; more: Announcement[] }

/** /news/:slug */
@Component({
  selector: 'app-news-item-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let a = p.data.item;
      <app-page-hero [eyebrow]="a.kind === 'announcement' ? 'Announcement' : 'News'" [title]="a.title" [lead]="a.summary" [crumbs]="crumbs()">
        <p class="d-flex flex-wrap align-items-center gap-4 pt-2 fs-small text-periwinkle">
          <span class="d-flex align-items-center gap-1h"><span icon="calendar_today" [size]="16"></span><time [attr.datetime]="a.publishedAt">{{ date() }}</time></span>
          <span class="d-flex align-items-center gap-1h"><span icon="domain" [size]="16"></span>{{ p.site.company.name }}</span>
        </p>
      </app-page-hero>
      <section class="py-16 py-lg-20">
        <div class="wrap mw-3xl stack-8">
          @if (a.imageUrl) { <img [src]="a.imageUrl" [alt]="a.title" class="cover rounded" width="1200" height="675" /> }
          <div class="prose-spine">@for (para of a.body ?? []; track $index) { <p>{{ para }}</p> }</div>
          <p class="border-top pt-6"><a routerLink="/news" class="link-arrow">All announcements &amp; news <span icon="arrow_forward" [size]="16"></span></a></p>
        </div>
      </section>
      @if (p.data.more.length) {
        <section class="bg-mist py-16">
          <div class="wrap">
            <h2 class="serif-h2">More from Spine Advisory</h2>
            <div class="mt-8 grid gap-8">
              @for (m of p.data.more; track m.slug) { <app-announcement-card [item]="m" class="g-col-12 g-col-md-4" /> }
            </div>
          </div>
        </section>
      }
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `:host { display: block; } .cover { width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; }`,
})
export class NewsItemPage extends PageBase<NewsItemData> {
  readonly date = computed(() => (this.ok() ? formatDate(this.ok()!.data.item.publishedAt) : ''));
  readonly crumbs = computed(() => {
    const a = this.ok()?.data.item;
    return [{ name: 'Home', href: '/' }, { name: 'News', href: '/news/' }, ...(a ? [{ name: a.title, href: `/news/${a.slug}/` }] : [])];
  });
  protected meta(_s: Site, d: NewsItemData) {
    const a = d.item;
    return {
      title: a.title,
      description: a.summary.slice(0, 160),
      image: a.imageUrl,
      type: 'article' as const,
      publishedTime: a.publishedAt,
      schema: [breadcrumbs(this.crumbs()), { '@type': 'NewsArticle', headline: a.title, description: a.summary, datePublished: a.publishedAt, url: abs(`/news/${a.slug}/`) }],
    };
  }
}
