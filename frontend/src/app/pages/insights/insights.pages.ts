import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { bannerOg } from '../../core/banners';
import { formatDate, sectionId } from '../../core/format';
import type { Article, Paged, Site } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { abs, article as articleSchema, breadcrumbs, faqPage } from '../../core/schema';
import { ArticleCardComponent } from '../../shared/cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { CtaBandComponent, FaqSectionComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, ArticleCardComponent, FaqSectionComponent, CtaBandComponent, PageFallbackComponent, ...MOTION];
const PAGE_SIZE = 12;


@Component({
  selector: 'app-insights-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Spine policy research" title="Thought Leadership & Strategic Briefs" [content]="p.site.pages?.['insights']"
        lead="Practitioner perspectives on public policy, concession de-risking and capital-efficient infrastructure delivery." banner="port-dusk" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap">
          @if (p.data.data.length) {
            <div class="grid gap-8" revealGroup>
              @for (a of p.data.data; track a.slug) { <app-article-card [article]="a" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
            </div>
          } @else {
            <div class="card mx-auto mw-2xl p-8 text-center">
              <h2 class="serif-h2">No briefs published yet</h2>
              <p class="mt-3 text-muted">New policy briefs will appear here. In the meantime, talk to the team about a specific programme.</p>
            </div>
          }
          @if (p.data.meta.pages > 1) {
            <nav class="mt-12 d-flex justify-content-center gap-2" aria-label="Insights pages">
              @for (n of pages(); track n) {
                <a [routerLink]="[]" [queryParams]="{ page: n === 1 ? null : n }" class="btn btn-compact" [class.btn-primary]="n === p.data.meta.page" [class.btn-outline]="n !== p.data.meta.page"
                   [attr.aria-current]="n === p.data.meta.page ? 'page' : null">{{ n }}</a>
              }
            </nav>
          }
        </div>
      </section>
      <app-cta-band title="Want a briefing on a specific policy or programme?" [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class InsightsPage extends PageBase<Paged<Article>> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Insights', href: '/insights/' }];
  readonly pages = computed(() => Array.from({ length: this.ok()?.data.meta.pages ?? 1 }, (_, i) => i + 1));
  protected meta(_s: Site, d: Paged<Article>) {
    return {
      title: 'Insights & Policy Briefs',
      description: "Spine Advisory policy briefs on PPP concessions, highway HAM risk, port modernisation and India's semiconductor incentives — for officials, developers and investors.",
      schema: [
        breadcrumbs(this.crumbs),
        { '@type': 'CollectionPage', name: 'Insights & Policy Briefs', hasPart: d.data.map((a) => ({ '@type': 'Article', headline: a.title, url: abs(`/insights/${a.slug}/`), datePublished: a.published })) },
      ],
    };
  }
}

export interface InsightData { article: Article; more: Article[] }


@Component({
  selector: 'app-insight-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let a = p.data.article;
      <app-page-hero [eyebrow]="a.category" [title]="a.title" [lead]="a.summary" [banner]="a.banner" [crumbs]="crumbs()">
        <p class="d-flex flex-wrap align-items-center gap-4 pt-2 fs-small text-periwinkle">
          <span class="d-flex align-items-center gap-1h"><span icon="calendar_today" [size]="16"></span><time [attr.datetime]="a.published">{{ date() }}</time></span>
          <span class="d-flex align-items-center gap-1h"><span icon="schedule" [size]="16"></span>{{ a.readingMinutes }} min read</span>
          <span class="d-flex align-items-center gap-1h"><span icon="domain" [size]="16"></span>{{ p.site.company.name }}</span>
        </p>
      </app-page-hero>

      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12">
          <article class="g-col-12 g-col-lg-8">
            <div class="card border-accent-left p-6 p-md-8">
              <p class="eyebrow d-flex align-items-center gap-2 text-amber"><span icon="lightbulb" [size]="16"></span> Key takeaways</p>
              <ul class="prose-spine mt-2">@for (t of a.takeaways; track t) { <li>{{ t }}</li> }</ul>
            </div>
            <div class="mt-12 stack-12">
              @for (s of a.sections; track s.heading) {
                <section [attr.aria-labelledby]="sid(s.heading)">
                  <h2 [id]="sid(s.heading)" class="scroll-mt-32 serif-h2">{{ s.heading }}</h2>
                  <div class="prose-spine mt-4">
                    @for (para of s.body; track $index) { <p>{{ para }}</p> }
                    @if (s.bullets?.length) { <ul>@for (b of s.bullets; track b) { <li>{{ b }}</li> }</ul> }
                  </div>
                </section>
              }
            </div>
            <p class="mt-12 border-top pt-6 fs-small text-muted">This brief is for general information and does not constitute legal, financial or investment advice. Policy positions are as understood at the date of publication; readers should verify current notifications before acting.</p>
          </article>
          <aside class="g-col-12 g-col-lg-4">
            <div class="sticky-panel stack-6">
              <nav class="card p-6" aria-label="Contents">
                <p class="eyebrow text-muted">Contents</p>
                <ol class="mt-3 stack-2 fs-small">
                  @for (s of a.sections; track s.heading; let i = $index) {
                    <li><a [routerLink]="[]" [fragment]="sid(s.heading)" class="d-flex gap-2 text-ink-2 hover-cobalt"><span class="text-muted">{{ i + 1 }}.</span>{{ s.heading }}</a></li>
                  }
                </ol>
              </nav>
              <div class="navy-field rounded p-6 text-white">
                <p class="eyebrow text-amber-soft">Discuss this brief</p>
                <p class="mt-2 font-serif fs-h3">Talk to the team behind the analysis.</p>
                <a routerLink="/contact" class="btn btn-amber mt-5 w-100">Schedule a Briefing</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <app-faq-section [faqs]="a.faqs" />
      @if (p.data.more.length) {
        <section class="bg-mist py-16">
          <div class="wrap">
            <h2 class="serif-h2">More insights</h2>
            <div class="mt-8 grid gap-8">
              @for (m of p.data.more; track m.slug) { <app-article-card [article]="m" class="g-col-12 g-col-md-6" /> }
            </div>
          </div>
        </section>
      }
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class InsightPage extends PageBase<InsightData> {
  readonly sid = sectionId;
  readonly date = computed(() => (this.ok() ? formatDate(this.ok()!.data.article.published) : ''));
  readonly crumbs = computed(() => {
    const a = this.ok()?.data.article;
    return [{ name: 'Home', href: '/' }, { name: 'Insights', href: '/insights/' }, ...(a ? [{ name: a.category, href: `/insights/${a.slug}/` }] : [])];
  });
  protected meta(_s: Site, d: InsightData) {
    const a = d.article;
    const path = `/insights/${a.slug}/`;
    const image = bannerOg(a.banner) ?? '/assets/brand/og-default.jpg';
    return {
      title: a.title,
      description: a.metaDescription,
      image,
      type: 'article' as const,
      publishedTime: a.published,
      schema: [breadcrumbs(this.crumbs()), articleSchema({ title: a.title, description: a.metaDescription, path, image, published: a.published }), faqPage(a.faqs)],
    };
  }
}
