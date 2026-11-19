// About Us: Overview, Mission, Vision, Team (and individual team profiles).
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { joinAnd, officeAddress, pad2 } from '../../core/format';
import type { Faq, Leader, Site } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { breadcrumbs, faqPage, person } from '../../core/schema';
import { aboutLinks } from '../../layouts/navigation';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { SectionHeaderComponent } from '../../shared/section-header.component';
import { CtaBandComponent, FaqSectionComponent, LeaderPortraitComponent, OfficeGridComponent, SubNavComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, SubNavComponent, SectionHeaderComponent, CtaBandComponent, PageFallbackComponent, ...MOTION];
const about = { name: 'About Us', href: '/about/' };

function overviewFaqs(site: Site): Faq[] {
  const c = site.company;
  const cities = site.offices.map((o) => o.city);
  const head = site.offices.find((o) => o.headOffice) ?? site.offices[0];
  const [a, b] = site.leaders;
  return [
    { q: 'What is Spine Advisory?', a: `${c.description} The firm brings finance, engineering and risk specialists together on every mandate.` },
    {
      q: 'When was Spine Advisory founded and by whom?',
      a: `Spine Advisory was founded in ${c.founded} as a partnership firm by a group of Chartered Accountants, MBAs and engineers, several of whom had worked with leading consultancies and Big Four firms.${a && b ? ` It is led by co-founders ${a.name} (${a.role}) and ${b.name} (${b.role}).` : ''}`,
    },
    {
      q: 'Where is Spine Advisory located?',
      a: `Spine Advisory has offices in ${joinAnd(cities)}, with its head office at ${head ? officeAddress(head) : 'New Delhi, India'}. The firm serves public authorities and private clients across India; briefings can be held at any office, at the client’s premises or virtually.`,
    },
  ];
}

@Component({
  selector: 'app-about-overview-page',
  imports: [...SHARED, FaqSectionComponent, OfficeGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero [eyebrow]="'Est. ' + p.site.company.founded + ' · ' + p.site.offices.length + ' offices across India'" title="Company Overview" [content]="p.site.pages?.['about']"
        lead="A synergistic bench of Chartered Accountants, MBAs and engineers advising public authorities and enterprises across the full project lifecycle."
        banner="urban" [crumbs]="crumbs" />
      <app-sub-nav [links]="links" label="About Us" />

      <section class="py-20">
        <div class="wrap grid gap-12">
          <div class="g-col-12 g-col-lg-7" reveal>
            <app-section-header eyebrow="Who we are" title="Spine Advisory at a glance" />
            <ol class="mt-8 stack-6">
              @for (para of p.site.overview; track $index) {
                <li class="d-flex gap-5">
                  <span class="step-number">{{ pad2($index + 1) }}</span>
                  <p class="fs-prose text-ink-2">{{ para }}</p>
                </li>
              }
            </ol>
          </div>
          <div class="g-col-12 g-col-lg-5 align-self-start sticky-lg-panel" reveal>
            <div class="tile-grid stat-grid">
              @for (s of p.site.stats; track s.label) {
                <div class="bg-white p-6">
                  <p class="eyebrow text-muted">{{ s.label }}</p>
                  <p class="mt-2 fs-metric fw-bold text-navy">{{ s.value }}<span class="text-amber">{{ s.unit }}</span></p>
                  <p class="mt-1 fs-small text-muted">{{ s.note }}</p>
                </div>
              }
            </div>
            <div class="navy-field mt-6 rounded p-7 text-white">
              <p class="eyebrow text-amber-soft">Our mission</p>
              <p class="mt-2 font-serif fs-h2">“{{ p.site.mission.statement }}”</p>
              <a routerLink="/about/mission" class="mt-4 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-white link-arrow grow">Read our mission <span icon="arrow_forward" [size]="16"></span></a>
            </div>
          </div>
        </div>
      </section>

      <section class="border-top border-bottom bg-white py-20">
        <div class="wrap stack-10">
          <app-section-header eyebrow="Explore" title="More about the firm" />
          <div class="grid gap-6" revealGroup>
            @for (n of next(); track n.href) {
              <a [routerLink]="n.href" class="g-col-12 g-col-md-4 card card-interactive group d-flex flex-column p-7">
                <span class="icon-tile bg-navy text-white"><span [icon]="n.icon!" [size]="22"></span></span>
                <h3 class="mt-5 card-title gh-text-cobalt">{{ n.label }}</h3>
                <p class="mt-2 flex-1 fs-small text-muted">{{ n.text }}</p>
                <span class="mt-5 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-cobalt gh-gap-2">Read more <span icon="arrow_forward" [size]="16"></span></span>
              </a>
            }
          </div>
        </div>
      </section>

      <section class="py-20">
        <div class="wrap grid gap-10">
          <div class="g-col-12 g-col-lg-4">
            <app-section-header eyebrow="Pan-India presence" title="Four offices, one firm" lead="Teams in India’s principal commercial and administrative centres, working as one bench for clients nationwide." />
          </div>
          <app-office-grid [offices]="p.site.offices" class="g-col-12 g-col-lg-8" />
        </div>
      </section>

      <app-faq-section [faqs]="faqs()" />
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `.stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }`,
})
export class AboutOverviewPage extends PageBase<null> {
  readonly links = aboutLinks;
  readonly pad2 = pad2;
  readonly crumbs = [{ name: 'Home', href: '/' }, about];
  readonly faqs = computed(() => (this.ok() ? overviewFaqs(this.ok()!.site) : []));
  readonly next = computed(() => {
    const s = this.ok()?.site;
    if (!s) return [];
    return [
      { ...aboutLinks[1], text: `“${s.mission.statement}” — ten objectives and seven approaches that guide every engagement.` },
      { ...aboutLinks[2], text: `“${s.vision.statement}” — the conviction the firm is built around.` },
      { ...aboutLinks[3], text: `Meet the ${s.leaders.length} leaders who head the firm and lead its mandates.` },
    ];
  });
  protected meta(site: Site) {
    return {
      title: 'About Us — Company Overview',
      description: 'Spine Advisory: founded in 2010 by CAs, MBAs and engineers. Transaction, infrastructure and operational advisory, investment banking and risk management across India.',
      schema: [breadcrumbs(this.crumbs), { '@type': 'AboutPage', name: 'About Spine Advisory', mainEntity: { '@id': 'https://spineadvisory.com/#organization' } }, faqPage(overviewFaqs(site))],
    };
  }
}

@Component({
  selector: 'app-about-mission-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="About Us · Mission" title="Our Mission" [content]="p.site.pages?.['mission']" [lead]="'“' + p.site.mission.statement + '”'" banner="highway-mountains" [crumbs]="crumbs" />
      <app-sub-nav [links]="links" label="About Us" />

      <section class="py-20">
        <div class="wrap grid gap-12">
          <div class="g-col-12 g-col-lg-5" reveal>
            <p class="eyebrow text-cobalt">Mission statement</p>
            <blockquote class="mt-4 statement">
              <p class="section-title fw-normal">“{{ p.site.mission.statement }}”</p>
            </blockquote>
          </div>
          <div class="g-col-12 g-col-lg-7" reveal>
            <p class="eyebrow text-cobalt">What it means</p>
            <p class="mt-4 fs-lead lh-relaxed text-ink-2">{{ p.site.mission.description }}</p>
          </div>
        </div>
      </section>

      <section class="border-top border-bottom bg-white py-20" id="objectives">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Mission objectives" title="Ten commitments we hold ourselves to" />
          <ol class="tile-grid two-col" revealGroup>
            @for (o of p.site.mission.objectives; track $index) {
              <li class="d-flex gap-5 bg-white p-6 hover-mist objective">
                <span class="step-number">{{ pad2($index + 1) }}</span>
                <p class="text-ink-2">{{ o }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <section class="navy-field py-20 text-white scroll-mt-28" id="approach">
        <div class="wrap stack-12">
          <div class="mw-3xl stack-3">
            <p class="eyebrow text-amber-soft">Our approaches</p>
            <h2 class="section-title text-white">Seven steps from understanding to lasting results</h2>
            <p class="fs-lead text-periwinkle">A disciplined method applied to every mandate, whatever its size.</p>
          </div>
          <ol class="tile-grid on-dark four-col" revealGroup>
            @for (s of p.site.approach; track s.title; let i = $index) {
              <li class="bg-navy-80 p-6">
                <span class="step-number big text-amber-soft">{{ pad2(i + 1) }}</span>
                <h3 class="mt-4 fw-semibold text-white">{{ s.title }}</h3>
                <p class="mt-1 fs-small text-periwinkle">{{ s.text }}</p>
              </li>
            }
            <li class="d-flex align-items-center bg-cobalt p-6">
              <a routerLink="/contact" class="d-inline-flex align-items-center gap-1 fw-semibold text-white">Start a conversation <span icon="arrow_forward" [size]="16"></span></a>
            </li>
          </ol>
        </div>
      </section>

      <section class="py-20">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Values" title="Integrity and teamwork, in practice" [center]="true" />
          <div class="grid gap-6" revealGroup>
            @for (v of p.site.values; track v.title) {
              <div class="g-col-12 g-col-sm-6 g-col-lg-3 card card-interactive p-7">
                <span class="icon-tile bg-mist text-cobalt"><span [icon]="v.icon" [size]="22"></span></span>
                <h3 class="mt-5 card-title">{{ v.title }}</h3>
                <p class="mt-2 fs-small text-muted">{{ v.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `
    .statement { border-left: 3px solid var(--c-amber); padding-left: 1.5rem; margin: 0; }
    .two-col { grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 640px) { .two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .four-col { grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 640px) { .four-col { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (min-width: 1024px) { .four-col { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    .objective { transition: background-color 150ms ease; }
    .big { font-size: 2rem; }
  `,
})
export class AboutMissionPage extends PageBase<null> {
  readonly links = aboutLinks;
  readonly pad2 = pad2;
  readonly crumbs = [{ name: 'Home', href: '/' }, about, { name: 'Mission', href: '/about/mission/' }];
  protected meta(site: Site) {
    return {
      title: 'Our Mission, Objectives & Approach',
      description: `Spine Advisory's mission: "${site.mission.statement}". Ten objectives on value, quality, confidentiality and people, and a seven-step approach to every mandate.`,
      schema: [breadcrumbs(this.crumbs)],
    };
  }
}

@Component({
  selector: 'app-about-vision-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="About Us · Vision" title="Our Vision" [content]="p.site.pages?.['vision']" [lead]="'“' + p.site.vision.statement + '”'" banner="metro" [crumbs]="crumbs" />
      <app-sub-nav [links]="links" label="About Us" />

      <section class="py-20">
        <div class="wrap grid gap-12">
          <div class="g-col-12 g-col-lg-5" reveal>
            <p class="eyebrow text-cobalt">Vision statement</p>
            <blockquote class="mt-4 statement">
              <p class="section-title fw-normal">“{{ p.site.vision.statement }}”</p>
            </blockquote>
            <p class="mt-8 text-muted">Our clients’ success and ours are two parts of the same whole. Everything below follows from that conviction.</p>
          </div>
          <ol class="g-col-12 g-col-lg-7 stack-4" revealGroup>
            @for (pt of p.site.vision.points; track $index) {
              <li class="card card-interactive d-flex gap-5 p-6">
                <span class="icon-tile square-10 bg-navy font-serif fs-lg fw-semibold text-amber-soft">{{ $index + 1 }}</span>
                <p class="align-self-center vision-point text-ink-2">{{ pt }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <section class="border-top bg-white py-20">
        <div class="wrap grid gap-10 align-items-center">
          <div class="g-col-12 g-col-lg-8">
            <app-section-header eyebrow="How we get there" [title]="'“' + p.site.mission.statement + '”'" lead="Our mission sets out the objectives and seven-step approach that turn this vision into everyday practice." />
          </div>
          <div class="g-col-12 g-col-lg-4 d-flex flex-wrap gap-3 justify-content-lg-end">
            <a routerLink="/about/mission" class="btn btn-primary">Our mission <span icon="arrow_forward" [size]="18"></span></a>
            <a routerLink="/about/team" class="btn btn-outline">Meet the team</a>
          </div>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `.statement { border-left: 3px solid var(--c-amber); padding-left: 1.5rem; margin: 0; } .vision-point { font-size: 1.0625rem; }`,
})
export class AboutVisionPage extends PageBase<null> {
  readonly links = aboutLinks;
  readonly crumbs = [{ name: 'Home', href: '/' }, about, { name: 'Vision', href: '/about/vision/' }];
  protected meta(site: Site) {
    return {
      title: 'Our Vision',
      description: `Spine Advisory's vision: "${site.vision.statement}". Consistently high standards of service and the aim to be the most trusted solutions provider to our clients.`,
      schema: [breadcrumbs(this.crumbs)],
    };
  }
}

@Component({
  selector: 'app-about-team-page',
  imports: [...SHARED, LeaderPortraitComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="About Us · Team" title="Our Team" [content]="p.site.pages?.['team']"
        lead="Every Spine Advisory mandate is led personally by a member of the leadership team, with direct access for clients throughout the engagement." [crumbs]="crumbs" />
      <app-sub-nav [links]="links" label="About Us" />

      <section class="py-20">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Leadership" title="The people behind the firm" lead="Select a profile to read more about each leader’s role and areas of focus." />
          <ul class="grid gap-6" revealGroup>
            @for (l of p.site.leaders; track l.slug; let i = $index) {
              <li class="g-col-12 g-col-sm-6 g-col-lg-3">
                <a [routerLink]="'/about/team/' + l.slug" class="card card-interactive group d-block overflow-hidden h-100">
                  <div class="overflow-hidden"><app-leader-portrait [leader]="l" [eager]="i < 2" [square]="true" class="gh-zoom-sm" /></div>
                  <div class="member-body p-5">
                    <h2 class="card-title gh-text-cobalt">{{ l.name }}</h2>
                    <p class="mt-1 fs-small fw-medium text-muted">{{ l.role }}</p>
                    <span class="mt-4 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-cobalt gh-gap-2">View profile <span icon="arrow_forward" [size]="16"></span></span>
                  </div>
                </a>
              </li>
            }
          </ul>
        </div>
      </section>

      <section class="border-top bg-white py-16">
        <div class="wrap d-flex flex-column align-items-start justify-content-between gap-6 flex-md-row align-items-md-center">
          <div>
            <p class="eyebrow text-cobalt">Join the team</p>
            <h2 class="mt-2 serif-h2">Build your career with Spine Advisory</h2>
            <p class="mt-2 text-muted">We look for Chartered Accountants, MBAs, engineers and technologists who want to shape India’s infrastructure.</p>
          </div>
          <a routerLink="/careers" class="btn btn-primary flex-shrink-0">View openings <span icon="arrow_forward" [size]="18"></span></a>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `
    .member-body { border-top: 3px solid transparent; transition: border-color 150ms ease; }
    .group:hover .member-body { border-top-color: var(--c-amber); }
  `,
})
export class AboutTeamPage extends PageBase<null> {
  readonly links = aboutLinks;
  readonly crumbs = [{ name: 'Home', href: '/' }, about, { name: 'Team', href: '/about/team/' }];
  protected meta(site: Site) {
    return {
      title: 'Our Team — Leadership',
      description: `Meet the Spine Advisory team: ${site.leaders.map((l) => `${l.name}, ${l.role}`).join('; ')}.`,
      schema: [breadcrumbs(this.crumbs), ...site.leaders.map((l) => person({ name: l.name, role: l.role, path: `/about/team/${l.slug}/`, description: l.bio[0] ?? l.role, image: l.photo }))],
    };
  }
}


@Component({
  selector: 'app-team-member-page',
  imports: [...SHARED, LeaderPortraitComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero [eyebrow]="p.data.role" [title]="p.data.name" [lead]="p.data.credentials" [crumbs]="crumbs()" />
      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12">
          <div class="g-col-12 g-col-md-4">
            <app-leader-portrait [leader]="p.data" [eager]="true" />
            <div class="card mt-6 p-6">
              <p class="eyebrow text-muted">Areas of focus</p>
              <ul class="mt-3 stack-2">
                @for (f of p.data.focus; track f) { <li class="d-flex align-items-start gap-2 fs-small text-ink-2"><span icon="check_circle" [size]="16" class="mt-0h text-cobalt"></span>{{ f }}</li> }
              </ul>
              <a routerLink="/contact" class="btn btn-primary mt-6 w-100">Request a meeting</a>
            </div>
          </div>
          <article class="g-col-12 g-col-md-8">
            <p class="eyebrow text-cobalt">Profile</p>
            <h2 class="mt-2 serif-h1">About {{ firstName() }}</h2>
            <div class="prose-spine mt-6">
              @for (para of p.data.bio; track $index) { <p>{{ para }}</p> }
            </div>
          </article>
        </div>
      </section>
      <section class="bg-mist py-16">
        <div class="wrap">
          <div class="d-flex align-items-end justify-content-between gap-6">
            <h2 class="serif-h2">More of our team</h2>
            <a routerLink="/about/team" class="link-arrow fs-sm">Full team <span icon="arrow_forward" [size]="16"></span></a>
          </div>
          <div class="mt-8 grid gap-6">
            @for (o of others(); track o.slug) {
              <a [routerLink]="'/about/team/' + o.slug" class="g-col-12 g-col-sm-4 card card-interactive d-flex align-items-center gap-4 p-4">
                <app-leader-portrait [leader]="o" monogramSize="2rem" class="mini flex-shrink-0" />
                <span><span class="d-block fw-semibold text-ink">{{ o.name }}</span><span class="fs-small text-muted">{{ o.role }}</span></span>
              </a>
            }
          </div>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `.mini { width: 5rem; }`,
})
export class TeamMemberPage extends PageBase<Leader> {
  readonly firstName = computed(() => this.ok()?.data.name.split(' ')[0] ?? '');
  readonly others = computed(() => (this.ok() ? this.ok()!.site.leaders.filter((x) => x.slug !== this.ok()!.data.slug) : []));
  readonly crumbs = computed(() => {
    const l = this.ok()?.data;
    return [{ name: 'Home', href: '/' }, about, { name: 'Team', href: '/about/team/' }, ...(l ? [{ name: l.name, href: `/about/team/${l.slug}/` }] : [])];
  });
  protected meta(site: Site, l: Leader) {
    const path = `/about/team/${l.slug}/`;
    return {
      title: `${l.name} — ${l.role}`,
      description: `${l.name} is ${l.role} of ${site.company.name}. ${l.bio[0] ?? ''}`.slice(0, 155),
      type: 'profile' as const,
      image: l.photo,
      schema: [breadcrumbs(this.crumbs()), { ...person({ name: l.name, role: l.role, path, description: l.bio.join(' '), image: l.photo }), knowsAbout: l.focus }],
    };
  }
}
