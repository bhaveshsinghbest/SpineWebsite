// Clientele, Association, Testimonials, Contact Us.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { officeAddress } from '../../core/format';
import type { Site, Testimonial } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { breadcrumbs } from '../../core/schema';
import { BriefingFormComponent } from '../../shared/briefing-form.component';
import { TestimonialCardComponent } from '../../shared/cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { SectionHeaderComponent } from '../../shared/section-header.component';
import { ClientBarComponent, CtaBandComponent, OfficeGridComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, SectionHeaderComponent, CtaBandComponent, ClientBarComponent, PageFallbackComponent, ...MOTION];

@Component({
  selector: 'app-clientele-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Trusted institutional relationships" title="Clientele" [content]="p.site.pages?.['clientele']"
        lead="Infrastructure developers, EPC contractors and consulting firms who rely on Spine Advisory for transaction, financial and engineering advice." banner="logistics" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap stack-10">
          <app-section-header eyebrow="Our clients" title="Concessionaires, developers & conglomerates" lead="A selection of organisations Spine Advisory has served." />
          <app-client-bar [clients]="p.site.clients" />
        </div>
      </section>
      <section class="border-top border-bottom bg-white py-20">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Who we work for" title="Public and private sector clients" />
          <div class="grid gap-6" revealGroup>
            @for (s of segments; track s.title) {
              <div class="g-col-12 g-col-sm-6 g-col-lg-3 card card-interactive p-7">
                <span class="icon-tile bg-mist text-cobalt"><span [icon]="s.icon" [size]="22"></span></span>
                <h3 class="mt-5 card-title">{{ s.title }}</h3>
                <p class="mt-2 fs-small text-muted">{{ s.text }}</p>
              </div>
            }
          </div>
          <div class="d-flex flex-column align-items-start justify-content-between gap-4 rounded border bg-mist p-5 flex-sm-row align-items-sm-center">
            <p class="d-flex align-items-center gap-3 fs-small text-ink-2"><span icon="workspace_premium" [size]="22" class="text-cobalt"></span>We also work alongside a network of associate firms in audit, consulting and advisory.</p>
            <a routerLink="/association" class="link-arrow flex-shrink-0 fs-sm">Our associations <span icon="arrow_forward" [size]="16"></span></a>
          </div>
        </div>
      </section>
      <app-cta-band title="Request our credentials and past-performance dossier" [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class ClientelePage extends PageBase<null> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Clientele', href: '/clientele/' }];
  readonly segments = [
    { icon: 'account_balance', title: 'Government & public authorities', text: 'Central and state departments, authorities and public sector undertakings preparing and procuring projects.' },
    { icon: 'engineering', title: 'Developers & EPC contractors', text: 'Concessionaires and contractors bidding for, financing and executing infrastructure projects.' },
    { icon: 'domain', title: 'Enterprises & promoters', text: 'Manufacturing, real estate and logistics businesses raising capital and strengthening operations.' },
    { icon: 'insights', title: 'Investors & lenders', text: 'Funds, banks and financial institutions needing due diligence, valuation and independent review.' },
  ];
  protected meta(site: Site) {
    return {
      title: 'Clientele',
      description: `Spine Advisory clients include ${site.clients.slice(0, 4).map((c) => c.name).join(', ')} and other infrastructure developers and EPC leaders.`,
      schema: [breadcrumbs(this.crumbs)],
    };
  }
}

@Component({
  selector: 'app-association-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Partner with us" title="Association" [content]="p.site.pages?.['association']"
        lead="Great things in business are never done by one person. Spine Advisory works with a network of associate firms to bring specialist depth to every mandate." banner="port-dusk" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap grid gap-12">
          <div class="g-col-12 g-col-lg-5">
            <app-section-header eyebrow="Our associates" title="Firms we work alongside" [lead]="p.site.associates.length + ' associate firms in audit, consulting and advisory.'" />
          </div>
          <ul class="g-col-12 g-col-lg-7 grid gap-3 align-content-start" revealGroup>
            @for (a of p.site.associates; track a) {
              <li class="g-col-12 g-col-sm-6 card card-interactive d-flex align-items-center gap-3 p-5"><span icon="hub" [size]="20" class="text-cobalt"></span><span class="fw-medium text-ink">{{ a }}</span></li>
            }
          </ul>
        </div>
      </section>
      <section class="border-top border-bottom bg-white py-20">
        <div class="wrap stack-12">
          <app-section-header eyebrow="Why we associate" title="One extended team for the client" [center]="true" />
          <div class="grid gap-6" revealGroup>
            @for (w of why; track w.title) {
              <div class="g-col-12 g-col-md-4 card p-7">
                <span class="icon-tile bg-navy text-white"><span [icon]="w.icon" [size]="22"></span></span>
                <h3 class="mt-5 card-title">{{ w.title }}</h3>
                <p class="mt-2 fs-small text-muted">{{ w.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>
      <section class="py-16">
        <div class="wrap">
          <div class="card d-flex flex-column align-items-start justify-content-between gap-6 p-7 p-md-10 flex-md-row align-items-md-center">
            <div>
              <p class="eyebrow text-cobalt">Become an associate</p>
              <h2 class="mt-2 serif-h2">Interested in partnering with Spine Advisory?</h2>
              <p class="mt-2 mw-2xl text-muted">Professional firms that share our standards are welcome to write to us with a short profile of their practice, team and areas of expertise.</p>
            </div>
            <a [href]="'mailto:' + p.site.company.email + '?subject=' + subject" class="btn btn-primary flex-shrink-0"><span icon="mail" [size]="18"></span> Write to us</a>
          </div>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class AssociationPage extends PageBase<null> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Association', href: '/association/' }];
  readonly subject = encodeURIComponent('Association enquiry');
  readonly why = [
    { icon: 'hub', title: 'Specialist depth', text: 'Associate firms add specialist audit, tax, legal-commercial and technical capacity to Spine’s multidisciplinary bench.' },
    { icon: 'location_on', title: 'Wider reach', text: 'Local presence and knowledge help mandates move faster across states and sectors.' },
    { icon: 'verified_user', title: 'Shared standards', text: 'Every association follows the same commitments to quality, confidentiality and ethical conduct.' },
  ];
  protected meta(site: Site) {
    return {
      title: 'Association — Associate Firms',
      description: `Spine Advisory works with a network of associate firms including ${site.associates.slice(0, 3).join(', ')} to bring specialist depth to every mandate.`,
      schema: [breadcrumbs(this.crumbs)],
    };
  }
}


@Component({
  selector: 'app-testimonials-page',
  imports: [...SHARED, TestimonialCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="In our clients’ words" title="Testimonials" [content]="p.site.pages?.['testimonials']"
        lead="Feedback from the authorities, developers and enterprises we advise. Every testimonial is published with the client’s written approval." banner="roads" [crumbs]="crumbs" />
      <section class="py-20">
        <div class="wrap stack-12">
          @if (p.data.length) {
            <app-section-header eyebrow="Client feedback" title="What our clients say" />
            <div class="grid gap-6" revealGroup>
              @for (t of p.data; track t.name) { <app-testimonial-card [t]="t" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
            </div>
          } @else {
            <div class="card mx-auto mw-3xl p-8 p-md-12 text-center">
              <span class="icon-tile square-14 mx-auto bg-mist text-cobalt"><span icon="format_quote" [size]="28"></span></span>
              <h2 class="mt-6 serif-h2">Client testimonials are on their way</h2>
              <p class="mx-auto mt-3 mw-xl text-muted">Our engagements are confidential, so we publish feedback only once a client has approved the wording. In the meantime, we are happy to arrange references from clients who have agreed to speak with prospective clients.</p>
              <div class="mt-8 d-flex flex-wrap justify-content-center gap-3">
                <a routerLink="/contact" class="btn btn-primary"><span icon="mail" [size]="18"></span> Request a reference</a>
                <a routerLink="/clientele" class="btn btn-outline">View our clientele</a>
              </div>
            </div>
          }
        </div>
      </section>
      <section class="border-top bg-white py-16">
        <div class="wrap stack-8">
          <div class="text-center">
            <p class="eyebrow text-muted">Trusted institutional relationships</p>
            <h2 class="mt-2 serif-h2">Organisations we have served</h2>
          </div>
          <app-client-bar [clients]="p.site.clients" />
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class TestimonialsPage extends PageBase<Testimonial[]> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Testimonials', href: '/testimonials/' }];
  protected meta() {
    return {
      title: 'Client Testimonials',
      description: 'What clients say about working with Spine Advisory on transaction advisory, investment banking, engineering and risk mandates.',
      schema: [breadcrumbs(this.crumbs)],
    };
  }
}

@Component({
  selector: 'app-contact-page',
  imports: [...SHARED, BriefingFormComponent, OfficeGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let c = p.site.company;
      <app-page-hero eyebrow="Confidentiality assured" title="Schedule a Partner-Level Briefing" [content]="p.site.pages?.['contact']"
        lead="We consult directly with Principal Secretaries, board members, concessionaire managing directors and investment committees. Enquiries are handled under strict non-disclosure." banner="metro" [crumbs]="crumbs" />
      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12 align-items-start">
          <div class="g-col-12 g-col-lg-5 stack-6">
            <div class="card stack-5 p-7">
              <h2 class="eyebrow text-ink">General enquiries</h2>
              <p class="d-flex align-items-center gap-3"><span icon="mail" class="text-cobalt"></span><a class="hover-cobalt" [href]="'mailto:' + c.email">{{ c.email }}</a></p>
              <p class="d-flex align-items-center gap-3"><span icon="call" class="text-cobalt"></span><span><a class="hover-cobalt" [href]="'tel:' + c.phoneLandlineHref">{{ c.phoneLandline }}</a> · <a class="hover-cobalt" [href]="'tel:' + c.phoneMobileHref">{{ c.phoneMobile }}</a></span></p>
              <p class="d-flex align-items-start gap-3"><span icon="domain" class="mt-0h text-cobalt"></span><span class="text-muted">{{ c.legalName }} · Head office: {{ headAddress() }}</span></p>
            </div>
            <div class="navy-field rounded p-7 text-white">
              <p class="eyebrow text-amber-soft">What happens next</p>
              <ol class="mt-4 stack-3 fs-small text-periwinkle">
                <li class="d-flex gap-3"><span class="font-serif fs-lg text-amber-soft">1</span>A partner reviews your enquiry within one working day.</li>
                <li class="d-flex gap-3"><span class="font-serif fs-lg text-amber-soft">2</span>We arrange a confidential briefing — in person or virtual.</li>
                <li class="d-flex gap-3"><span class="font-serif fs-lg text-amber-soft">3</span>You receive a scoped proposal with team, timeline and fees.</li>
              </ol>
            </div>
          </div>
          <div class="g-col-12 g-col-lg-7 card p-7 p-md-10">
            <h2 class="serif-h2">Tell us about your mandate</h2>
            <p class="mb-8 mt-2 text-muted">Fields marked * are required.</p>
            <app-briefing-form [site]="p.site" />
          </div>
        </div>
      </section>
      <section id="offices" class="scroll-mt-28 border-top bg-white py-16 py-lg-20">
        <div class="wrap grid gap-10">
          <div class="g-col-12 g-col-lg-4">
            <p class="eyebrow text-cobalt">Pan-India presence</p>
            <h2 class="mt-2 section-title">Our offices</h2>
            <p class="mt-3 text-muted">Partner-led teams in four of India’s principal commercial and administrative centres, serving clients nationwide.</p>
          </div>
          <app-office-grid [offices]="p.site.offices" class="g-col-12 g-col-lg-8" />
        </div>
      </section>
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class ContactPage extends PageBase<null> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Contact Us', href: '/contact/' }];
  readonly headAddress = computed(() => {
    const s = this.ok()?.site;
    const head = s?.offices.find((o) => o.headOffice) ?? s?.offices[0];
    return head ? officeAddress(head) : '';
  });
  protected meta(site: Site) {
    return {
      title: 'Contact Us — Schedule a Briefing',
      description: `Schedule a confidential briefing with Spine Advisory. Offices in ${site.offices.map((o) => o.city).join(', ')}. Email ${site.company.email}.`,
      schema: [breadcrumbs(this.crumbs), { '@type': 'ContactPage', name: 'Contact Spine Advisory', about: { '@id': 'https://spineadvisory.com/#organization' } }],
    };
  }
}
