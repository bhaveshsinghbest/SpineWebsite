// Infrastructure sectors, industries and strategic pillars share one content shape and one detail template.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { bannerOg } from '../../core/banners';
import { sectionId } from '../../core/format';
import type { Faq, Practice, Sector, SectorKind, Site } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { breadcrumbs, faqPage, itemList, service } from '../../core/schema';
import { PracticeCardComponent, SectorCardComponent } from '../../shared/cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { SectionHeaderComponent } from '../../shared/section-header.component';
import { CtaBandComponent, FaqSectionComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, SectionHeaderComponent, SectorCardComponent, PracticeCardComponent, FaqSectionComponent, CtaBandComponent, PageFallbackComponent, ...MOTION];
export const BASE: Record<SectorKind, { path: string; label: string }> = {
  sector: { path: 'sectors', label: 'Sectors' },
  industry: { path: 'industries', label: 'Industries' },
  pillar: { path: 'strategic-pillars', label: 'Strategic Pillars' },
};

// ---------- Index pages ----------
const sectorsFaqs = (items: Sector[]): Faq[] => [
  {
    q: 'Which infrastructure sectors does Spine Advisory advise on?',
    a: `Spine Advisory advises across ${items.length} sectors: ${items.map((s) => s.shortTitle).join(', ')}. In each, the firm combines transaction advisory, financial modelling, engineering and risk expertise so that projects move from concept to financial close and implementation with one accountable team.`,
  },
  {
    q: 'Does Spine Advisory work for government authorities or private developers?',
    a: 'Spine Advisory works for both. Public authorities engage the firm to prepare and procure projects — feasibility, structuring, bid documents and bid process management — while developers, EPC contractors and investors engage it for bid support, project finance, due diligence, contract management and independent review.',
  },
];

@Component({
  selector: 'app-sectors-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Domain foundation since 2010" title="Core Infrastructure Sector Practices" [content]="p.site.pages?.['sectors']"
        lead="From project conceptualisation to commercial operation date, Spine Advisory delivers integrated financial, commercial and engineering advisory across India’s foundational sectors."
        banner="roads" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap stack-12">
          <div class="d-flex flex-column justify-content-between gap-6 flex-md-row align-items-md-end">
            <app-section-header eyebrow="Sector coverage" title="Where we work" lead="Each sector practice brings together policy knowledge, concession structuring and on-the-ground engineering judgement." />
            <a routerLink="/industries" class="link-arrow flex-shrink-0">Industries we serve <span icon="arrow_forward" [size]="16"></span></a>
          </div>
          <div class="grid gap-6" revealGroup>
            @for (s of p.data; track s.slug) { <app-sector-card [item]="s" [href]="'/sectors/' + s.slug" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
          </div>
        </div>
      </section>
      <app-faq-section [faqs]="faqs()" />
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class SectorsPage extends PageBase<Sector[]> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Sectors', href: '/sectors/' }];
  readonly faqs = computed(() => sectorsFaqs(this.ok()?.data ?? []));
  protected meta(_s: Site, d: Sector[]) {
    return {
      title: 'Infrastructure Sectors We Advise',
      description: "Transaction, financial and engineering advisory for India's highways, ports, railways, metro and urban infrastructure — from feasibility to financial close.",
      schema: [breadcrumbs(this.crumbs), itemList(d.map((s) => ({ name: s.title, path: `/sectors/${s.slug}/` }))), faqPage(sectorsFaqs(d))],
    };
  }
}

const industriesFaqs = (items: Sector[]): Faq[] => [
  {
    q: 'Which industries does Spine Advisory serve?',
    a: `Spine Advisory serves ${items.map((i) => i.shortTitle).join(', ').replace(/, ([^,]*)$/, ' and $1')} businesses, alongside its core infrastructure sectors. For each industry the firm combines consulting, operation and risk advisory, investment banking, engineering and information technology so that one team can carry a project from feasibility to financing and steady-state operations.`,
  },
  {
    q: 'How is an industry engagement different from an infrastructure sector engagement?',
    a: 'Infrastructure sector work usually involves a public authority and a concession or PPP contract. Industry engagements are more often for private promoters and investors: market and feasibility studies, project finance and equity, internal controls, cost reduction, and the systems that keep a plant, a property or a logistics operation performing.',
  },
];

@Component({
  selector: 'app-industries-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Industries we serve" title="Industry Expertise" [content]="p.site.pages?.['industries']"
        lead="Integrated financial, operational and engineering advisory for promoters, investors and public agencies in three industries where capital and execution decide outcomes."
        banner="logistics" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Industries" title="Where our practices come together"
            lead="Each industry team draws on all five practices — consulting, operation and risk advisory, investment banking, engineering services and information technology." />
          <div class="grid gap-6" revealGroup>
            @for (s of p.data.industries; track s.slug) { <app-sector-card [item]="s" [href]="'/industries/' + s.slug" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
          </div>
        </div>
      </section>
      <section class="border-top border-bottom bg-white py-16">
        <div class="wrap grid gap-8 align-items-center">
          <div class="g-col-12 g-col-lg-7">
            <p class="eyebrow text-cobalt">Also</p>
            <h2 class="mt-2 serif-h2">Core infrastructure sectors</h2>
            <p class="mt-2 text-muted">Transaction advisory and engineering for public infrastructure: {{ sectorNames() }}.</p>
          </div>
          <div class="g-col-12 g-col-lg-5 d-flex flex-wrap gap-2 justify-content-lg-end">
            @for (s of p.data.sectors; track s.slug) { <a [routerLink]="'/sectors/' + s.slug" class="chip"><span [icon]="s.icon" [size]="16"></span>{{ s.shortTitle }}</a> }
          </div>
        </div>
      </section>
      <app-faq-section [faqs]="faqs()" />
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class IndustriesPage extends PageBase<{ industries: Sector[]; sectors: Sector[] }> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Industries', href: '/industries/' }];
  readonly faqs = computed(() => industriesFaqs(this.ok()?.data.industries ?? []));
  readonly sectorNames = computed(() => (this.ok()?.data.sectors ?? []).map((s) => s.shortTitle).join(', '));
  protected meta(_s: Site, d: { industries: Sector[] }) {
    return {
      title: 'Industries — Manufacturing, Real Estate, Logistics & Transportation',
      description: 'Advisory for manufacturing, real estate and logistics & transportation businesses in India: feasibility, project finance, valuation, controls and cost optimisation.',
      schema: [breadcrumbs(this.crumbs), itemList(d.industries.map((s) => ({ name: s.title, path: `/industries/${s.slug}/` }))), faqPage(industriesFaqs(d.industries))],
    };
  }
}

const pillarsFaqs = (items: Sector[]): Faq[] => [
  {
    q: 'What are Spine Advisory’s strategic pillars?',
    a: `Spine Advisory’s strategic pillars are four frontier areas where national policy and private capital are converging: ${items.map((p) => p.shortTitle).join(', ')}. The firm applies its infrastructure structuring, financial modelling and engineering skills to help governments design programmes and investors assess and execute projects.`,
  },
  {
    q: 'How do the strategic pillars relate to the core infrastructure practice?',
    a: 'The strategic pillars build on the same disciplines as the core infrastructure practice — feasibility, structuring, incentive and concession design, financing and project management — applied to newer asset classes such as semiconductor units, green hydrogen hubs, export logistics corridors and public AI platforms.',
  },
];

@Component({
  selector: 'app-pillars-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Frontier advisory" title="Strategic Practice Pillars for Viksit Bharat" [content]="p.site.pages?.['pillars']"
        lead="Aligning national industrial policy with private capital deployment across four transformative economic frontiers." banner="semiconductor" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Four frontiers" title="Policy meets bankability" lead="Each pillar pairs programme-level policy insight with the project structuring discipline the firm has built in core infrastructure." />
          <div class="grid gap-6" revealGroup>
            @for (s of p.data; track s.slug) { <app-sector-card [item]="s" [href]="'/strategic-pillars/' + s.slug" variant="pillar" class="g-col-12 g-col-md-6 g-col-lg-3" /> }
          </div>
        </div>
      </section>
      <app-faq-section [faqs]="faqs()" />
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class PillarsPage extends PageBase<Sector[]> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Strategic Pillars', href: '/strategic-pillars/' }];
  readonly faqs = computed(() => pillarsFaqs(this.ok()?.data ?? []));
  protected meta(_s: Site, d: Sector[]) {
    return {
      title: 'Strategic Practice Pillars for Viksit Bharat',
      description: 'Advisory on semiconductor ecosystems, enterprise AI adoption, export trade corridors and green energy — aligning national policy with private capital.',
      schema: [breadcrumbs(this.crumbs), itemList(d.map((s) => ({ name: s.title, path: `/strategic-pillars/${s.slug}/` }))), faqPage(pillarsFaqs(d))],
    };
  }
}

// ---------- Detail page ----------
export interface DetailData { item: Sector; siblings: Sector[]; practices: Practice[] }

@Component({
  selector: 'app-sector-detail-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let item = p.data.item;
      <app-page-hero [eyebrow]="item.tag" [title]="item.title" [lead]="item.summary" [banner]="item.banner" [crumbs]="crumbs()">
        <div class="d-flex flex-wrap gap-3 pt-3">
          <a routerLink="/contact" class="btn btn-amber"><span icon="event_available" [size]="18"></span> Discuss a mandate</a>
          <a [routerLink]="[]" fragment="scope" class="btn btn-ghost-dark">Advisory scope <span icon="arrow_downward" [size]="18"></span></a>
        </div>
      </app-page-hero>

      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12">
          <article class="g-col-12 g-col-lg-8">
            <div class="card border-accent-left p-6 p-md-8">
              <p class="eyebrow text-amber">In brief</p>
              <p class="mt-3 font-serif fs-quote text-ink">{{ item.answer }}</p>
            </div>
            <div id="scope" class="mt-12 stack-12 scroll-mt-32">
              @for (s of item.sections; track s.heading) {
                <section [attr.aria-labelledby]="sid(s.heading)">
                  <h2 [id]="sid(s.heading)" class="serif-h2">{{ s.heading }}</h2>
                  <div class="prose-spine mt-4">
                    @for (para of s.body; track $index) { <p>{{ para }}</p> }
                    @if (s.bullets?.length) { <ul>@for (b of s.bullets; track b) { <li>{{ b }}</li> }</ul> }
                  </div>
                </section>
              }
            </div>
          </article>
          <aside class="g-col-12 g-col-lg-4 stack-6">
            <div class="card sticky-panel p-6">
              <p class="eyebrow text-muted">Advisory highlights</p>
              <ul class="mt-4 stack-3">
                @for (h of item.highlights; track h) { <li class="d-flex align-items-start gap-3 fs-small text-ink-2"><span icon="check_circle" [size]="18" class="highlight-icon text-cobalt"></span>{{ h }}</li> }
              </ul>
              <a routerLink="/contact" class="btn btn-primary mt-6 w-100">Request a briefing</a>
              <a routerLink="/about/team" class="mt-3 d-flex align-items-center justify-content-center gap-1 fs-small fw-semibold text-cobalt hover-underline">Meet the team <span icon="arrow_forward" [size]="16"></span></a>
            </div>
          </aside>
        </div>
      </section>

      @if (related().length) {
        <section class="border-top border-bottom bg-white py-16">
          <div class="wrap">
            <p class="eyebrow text-cobalt">Capabilities applied</p>
            <h2 class="mt-2 serif-h2">Services we bring to {{ kind() === 'industry' ? 'this industry' : 'this sector' }}</h2>
            <div class="mt-8 grid gap-6">
              @for (pr of related(); track pr.slug) { <app-practice-card [practice]="pr" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
            </div>
          </div>
        </section>
      }

      <app-faq-section [faqs]="item.faqs" [title]="item.shortTitle + ': common questions'" />

      @if (others().length) {
        <section class="bg-mist py-16">
          <div class="wrap">
            <div class="d-flex align-items-end justify-content-between gap-6">
              <h2 class="serif-h2">More {{ base().label.toLowerCase() }}</h2>
              <a [routerLink]="'/' + base().path" class="link-arrow fs-sm">View all <span icon="arrow_forward" [size]="16"></span></a>
            </div>
            <div class="mt-8 grid gap-6">
              @for (s of others(); track s.slug) {
                <app-sector-card [item]="s" [href]="'/' + base().path + '/' + s.slug" [variant]="kind() === 'pillar' ? 'pillar' : 'sector'" class="g-col-12 g-col-md-4" />
              }
            </div>
          </div>
        </section>
      }
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `.highlight-icon { margin-top: 1px; }`,
})
export class SectorDetailPage extends PageBase<DetailData> {
  readonly sid = sectionId;
  readonly kind = computed(() => this.ok()?.data.item.kind ?? 'sector');
  readonly base = computed(() => BASE[this.kind()]);
  readonly crumbs = computed(() => {
    const it = this.ok()?.data.item;
    const b = this.base();
    return [{ name: 'Home', href: '/' }, { name: b.label, href: `/${b.path}/` }, ...(it ? [{ name: it.shortTitle, href: `/${b.path}/${it.slug}/` }] : [])];
  });
  readonly related = computed(() => {
    const d = this.ok()?.data;
    // In the services catalogue order, as on the original site.
    return d ? d.practices.filter((p) => d.item.relatedPractices.includes(p.slug)) : [];
  });
  readonly others = computed(() => {
    const d = this.ok()?.data;
    return d ? d.siblings.filter((s) => s.slug !== d.item.slug).slice(0, 3) : [];
  });
  protected meta(_s: Site, d: DetailData) {
    const it = d.item;
    const path = `/${BASE[it.kind].path}/${it.slug}/`;
    return {
      title: `${it.title} Advisory`,
      description: it.metaDescription,
      image: bannerOg(it.banner),
      schema: [breadcrumbs(this.crumbs()), service({ name: `${it.title} Advisory`, description: it.answer, path, serviceType: it.highlights }), faqPage(it.faqs)],
    };
  }
}
