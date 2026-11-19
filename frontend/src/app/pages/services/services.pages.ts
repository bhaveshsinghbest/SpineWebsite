import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { bannerOg } from '../../core/banners';
import { pad2 } from '../../core/format';
import type { Faq, Practice, Sector, Site } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { abs, breadcrumbs, faqPage, service } from '../../core/schema';
import { PracticeCardComponent } from '../../shared/cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { SectionHeaderComponent } from '../../shared/section-header.component';
import { CtaBandComponent, FaqSectionComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, SectionHeaderComponent, PracticeCardComponent, FaqSectionComponent, CtaBandComponent, PageFallbackComponent, ...MOTION];


function servicesFaqs(practices: Practice[]): Faq[] {
  const total = practices.reduce((n, p) => n + p.items.length, 0);
  return [
    {
      q: 'What services does Spine Advisory offer?',
      a: `Spine Advisory offers ${total} services across ${practices.length === 5 ? 'five' : practices.length} practices: ${practices.map((p) => p.title).join('; ')}. Together they cover the full project lifecycle — feasibility and structuring, procurement, financing, engineering review, construction supervision and the controls and systems that keep assets performing.`,
    },
    {
      q: 'Can Spine Advisory take on a single service rather than a full mandate?',
      a: 'Yes. Clients can engage Spine Advisory for a discrete deliverable — for example a financial model, a traffic study, a valuation or a proof check — or for an end-to-end mandate covering several practices. Scope, team and fees are agreed at the outset of each engagement.',
    },
  ];
}

@Component({
  selector: 'app-services-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Institutional scope" title="Our Services" [content]="p.site.pages?.['services']"
        lead="Bridging financial engineering, concession architecture, technical feasibility and statutory governance — under one accountable team."
        banner="highway-mountains" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap stack-12">
          <app-section-header [eyebrow]="p.data.length === 5 ? 'Five practices' : p.data.length + ' practices'" title="One bench, the full project lifecycle"
            lead="Chartered Accountants, MBAs and engineers working side by side, from first feasibility to steady-state operations." />
          <div class="grid gap-6" revealGroup>
            @for (pr of p.data; track pr.slug) { <app-practice-card [practice]="pr" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
          </div>
        </div>
      </section>

      <section class="border-top border-bottom bg-white py-20">
        <div class="wrap">
          <app-section-header eyebrow="Service index" title="All services at a glance" />
          <div class="mt-10 grid column-gap-10 row-gap-10">
            @for (pr of p.data; track pr.slug) {
              <div class="g-col-12 g-col-md-6 g-col-lg-4">
                <h3 class="d-flex align-items-center gap-2 border-bottom pb-3 card-title"><span [icon]="pr.icon" [size]="20" class="text-cobalt"></span>{{ pr.title }}</h3>
                <ul class="mt-3 stack-1">
                  @for (it of pr.items; track it.id) {
                    <li><a [routerLink]="'/services/' + pr.slug" [fragment]="it.id" class="d-flex align-items-center justify-content-between gap-2 py-1 fs-small text-ink-2 hover-cobalt">{{ it.title }}<span icon="chevron_right" [size]="16" class="text-muted"></span></a></li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </section>
      <app-faq-section [faqs]="faqs()" />
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class ServicesPage extends PageBase<Practice[]> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }];
  readonly faqs = computed(() => servicesFaqs(this.ok()?.data ?? []));
  protected meta(_site: Site, data: Practice[]) {
    const total = data.reduce((n, p) => n + p.items.length, 0);
    return {
      title: 'Our Services — Consulting, Risk, Investment Banking, Engineering & IT',
      description: `${total} advisory services across consulting, operation and risk advisory, investment banking, engineering services and information technology for clients across India.`,
      schema: [breadcrumbs(this.crumbs), faqPage(servicesFaqs(data))],
    };
  }
}

export interface ServiceData { practice: Practice; practices: Practice[]; industries: Sector[]; sectors: Sector[] }

@Component({
  selector: 'app-service-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let pr = p.data.practice;
      <app-page-hero eyebrow="Services" [title]="pr.title" [lead]="pr.summary" [banner]="pr.banner" [crumbs]="crumbs()">
        <div class="d-flex flex-wrap gap-2 pt-2">
          @for (t of pr.tags; track t) { <span class="tag bg-white-10 text-white">{{ t }}</span> }
        </div>
      </app-page-hero>

      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12">
          <nav class="d-none d-lg-block g-col-lg-3" aria-label="Services in this practice">
            <div class="sticky-panel">
              <p class="eyebrow text-muted">In this practice</p>
              <ul class="mt-4 border-start toc">
                @for (it of pr.items; track it.id) {
                  <li><a [routerLink]="[]" [fragment]="it.id" class="toc-link d-block py-2 ps-4 fs-small text-ink-2">{{ it.title }}</a></li>
                }
              </ul>
            </div>
          </nav>

          <div class="g-col-12 g-col-lg-9">
            <div class="card border-accent-left p-6 p-md-8">
              <p class="eyebrow text-amber">In brief</p>
              <p class="mt-3 font-serif fs-quote text-ink">{{ pr.answer }}</p>
            </div>

            <div class="mt-10 grid gap-6">
              @for (it of pr.items; track it.id; let i = $index) {
                <section [id]="it.id" class="g-col-12 g-col-md-6 card scroll-mt-32 p-7" [attr.aria-labelledby]="it.id + '-title'">
                  <span class="font-serif fw-semibold lh-none item-no text-line-strong">{{ pad2(i + 1) }}</span>
                  <h2 [id]="it.id + '-title'" class="mt-3 card-title">{{ it.title }}</h2>
                  <p class="mt-2 fs-small lh-relaxed text-ink-2">{{ it.description }}</p>
                  <p class="eyebrow mt-5 text-muted">Key deliverables</p>
                  <ul class="mt-2 stack-1h">
                    @for (d of it.deliverables; track d) { <li class="d-flex align-items-start gap-2 fs-small text-ink-2"><span icon="check_circle" [size]="16" class="mt-0h text-cobalt"></span>{{ d }}</li> }
                  </ul>
                </section>
              }
            </div>

            @if (applied().length) {
              <div class="mt-12">
                <p class="eyebrow text-muted">Applied across industries &amp; sectors</p>
                <div class="mt-3 d-flex flex-wrap gap-2">
                  @for (s of applied(); track s.href) { <a [routerLink]="s.href" class="chip"><span [icon]="s.icon" [size]="16"></span>{{ s.shortTitle }}</a> }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <app-faq-section [faqs]="pr.faqs" [title]="pr.title + ': common questions'" />

      <section class="bg-mist py-16">
        <div class="wrap">
          <h2 class="serif-h2">Other practices</h2>
          <div class="mt-8 grid gap-6">
            @for (o of others(); track o.slug) { <app-practice-card [practice]="o" class="g-col-12 g-col-md-6 g-col-lg-3" /> }
          </div>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `
    .toc-link { margin-left: -1px; border-left: 2px solid transparent; transition: color 150ms ease, border-color 150ms ease; }
    .toc-link:hover { border-left-color: var(--c-amber); color: var(--c-navy) !important; }
    .item-no { font-size: 2rem; }
  `,
})
export class ServicePage extends PageBase<ServiceData> {
  readonly pad2 = pad2;
  readonly crumbs = computed(() => {
    const pr = this.ok()?.data.practice;
    return [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }, ...(pr ? [{ name: pr.title, href: `/services/${pr.slug}/` }] : [])];
  });
  readonly others = computed(() => {
    const d = this.ok()?.data;
    return d ? d.practices.filter((x) => x.slug !== d.practice.slug) : [];
  });
  readonly applied = computed(() => {
    const d = this.ok()?.data;
    if (!d) return [];
    const slug = d.practice.slug;
    return [
      ...d.industries.filter((s) => s.relatedPractices.includes(slug)).map((s) => ({ ...s, href: `/industries/${s.slug}` })),
      ...d.sectors.filter((s) => s.relatedPractices.includes(slug)).map((s) => ({ ...s, href: `/sectors/${s.slug}` })),
    ];
  });
  protected meta(_site: Site, d: ServiceData) {
    const pr = d.practice;
    const path = `/services/${pr.slug}/`;
    return {
      title: pr.title,
      description: pr.metaDescription,
      image: bannerOg(pr.banner),
      schema: [
        breadcrumbs(this.crumbs()),
        {
          ...service({ name: pr.title, description: pr.answer, path }),
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: pr.title,
            itemListElement: pr.items.map((it) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: it.title, description: it.description, url: abs(`${path}#${it.id}`) } })),
          },
        },
        faqPage(pr.faqs),
      ],
    };
  }
}
