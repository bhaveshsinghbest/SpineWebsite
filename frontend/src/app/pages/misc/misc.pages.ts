// FAQ hub, Privacy Policy, Disclaimer, 404.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { FaqGroup, Site } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { breadcrumbs } from '../../core/schema';
import { SeoService } from '../../core/seo.service';
import { IconComponent } from '../../shared/icon.component';
import { NOT_FOUND_SEO, NotFoundContentComponent, PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { CtaBandComponent } from '../../shared/sections';
import { ApiService } from '../../core/api.service';
import { sectionId } from '../../core/format';


/** Every FAQ on the site, grouped by topic. FAQPage markup stays on the source pages (Google disallows duplicates). */
@Component({
  selector: 'app-faq-page',
  imports: [RouterLink, IconComponent, PageHeroComponent, CtaBandComponent, PageFallbackComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Knowledge base" title="Frequently Asked Questions" [content]="p.site.pages?.['faq']"
        lead="Direct answers on infrastructure advisory, PPP structuring, project finance and engineering — and on how Spine Advisory works." [crumbs]="crumbs" />
      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12">
          <nav class="d-none d-lg-block g-col-lg-3" aria-label="FAQ topics">
            <ul class="topics stack-1 border-start">
              @for (g of p.data; track g.href) { <li><a [routerLink]="[]" [fragment]="sid(g.title)" class="topic d-block py-1h ps-4 fs-small text-ink-2">{{ g.title }}</a></li> }
            </ul>
          </nav>
          <div class="g-col-12 g-col-lg-9 stack-14">
            @for (g of p.data; track g.href) {
              <section [id]="sid(g.title)" class="scroll-mt-32">
                <div class="d-flex align-items-end justify-content-between gap-4 border-bottom pb-3">
                  <h2 class="serif-h2">{{ g.title }}</h2>
                  <a [routerLink]="g.href" class="link-arrow flex-shrink-0 fs-small">Learn more <span icon="arrow_forward" [size]="16"></span></a>
                </div>
                <div class="divide-y">
                  @for (f of g.faqs; track f.q) {
                    <details class="py-4">
                      <summary class="no-marker d-flex align-items-start justify-content-between gap-6">
                        <h3 class="fw-semibold text-ink">{{ f.q }}</h3>
                        <span icon="expand_more" [size]="22" class="text-cobalt open-rotate"></span>
                      </summary>
                      <p class="mt-2 mw-3xl lh-relaxed text-ink-2">{{ f.a }}</p>
                    </details>
                  }
                </div>
              </section>
            }
          </div>
        </div>
      </section>
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `
    .topics { position: sticky; top: 8rem; max-height: calc(100vh - 10rem); overflow-y: auto; }
    .topic { margin-left: -1px; border-left: 2px solid transparent; transition: color 150ms ease, border-color 150ms ease; }
    .topic:hover { border-left-color: var(--c-amber); color: var(--c-navy) !important; }
    .stack-14 > * + * { margin-top: 3.5rem; }
  `,
})
export class FaqPage extends PageBase<FaqGroup[]> {
  readonly sid = sectionId;
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'FAQs', href: '/faq/' }];
  protected meta() {
    return {
      title: 'Frequently Asked Questions',
      description: "Answers on PPP structuring, HAM and BOT concessions, project finance, DPRs, independent engineering and Spine Advisory's services, sectors and approach.",
      schema: [breadcrumbs(this.crumbs)],
    };
  }
}

@Component({
  selector: 'app-privacy-page',
  imports: [PageHeroComponent, PageFallbackComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let c = p.site.company;
      <app-page-hero eyebrow="Legal" title="Privacy Policy" [crumbs]="crumbs" />
      <section class="py-16">
        <div class="wrap prose-spine mw-3xl">
          <p><strong>Draft — to be reviewed by the firm’s legal counsel before publication.</strong></p>
          <p>{{ c.legalName }} (“Spine Advisory”, “we”) respects the privacy of visitors to this website. This policy explains what personal data we collect, why we collect it and how it is protected, in line with the Digital Personal Data Protection Act, 2023 and other applicable Indian law.</p>
          <p><strong>Information we collect.</strong> When you submit the briefing form or write to us, we collect the details you provide: your name, designation, organisation, contact details and a description of your requirement. We do not use advertising trackers on this website.</p>
          <p><strong>Job applications.</strong> When you apply through the Careers page, we collect your name, contact details, location, qualifications, experience, any message you include and your CV. We use this only to assess your application, contact you about the role and, if you applied for future opportunities, about suitable openings. Applications are accessible only to the people involved in recruitment.</p>
          <p><strong>How we use it.</strong> We use this information only to respond to your enquiry, prepare a proposal and manage our professional relationship with you. We do not sell or rent personal data.</p>
          <p><strong>Sharing.</strong> Information may be shared with our associate firms or service providers only where required to respond to your enquiry, and always under confidentiality obligations.</p>
          <p><strong>Retention and your rights.</strong> We retain enquiry data only as long as needed for the purposes above or as required by law. You may ask to access, correct or erase your personal data, or withdraw consent, by writing to <a class="text-cobalt text-decoration-underline" [href]="'mailto:' + c.email">{{ c.email }}</a>.</p>
          <p><strong>Changes.</strong> We may update this policy from time to time; the current version will always be published on this page.</p>
        </div>
      </section>
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class PrivacyPage extends PageBase<null> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Privacy Policy', href: '/privacy/' }];
  protected meta(site: Site) {
    return { title: 'Privacy Policy', description: `How ${site.company.name} collects, uses and protects personal data submitted through this website.`, schema: [breadcrumbs(this.crumbs)] };
  }
}

@Component({
  selector: 'app-disclaimer-page',
  imports: [PageHeroComponent, PageFallbackComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Legal" title="Disclaimer" [crumbs]="crumbs" />
      <section class="py-16">
        <div class="wrap prose-spine mw-3xl">
          <p><strong>Draft — to be reviewed by the firm’s legal counsel before publication.</strong></p>
          <p>The content of this website, including policy briefs and frequently asked questions, is provided for general information only. It does not constitute legal, financial, tax, investment or engineering advice, and should not be relied on as such. Professional advice should be obtained for any specific situation.</p>
          <p>References to government policies, schemes and regulations reflect our understanding at the date of publication and may have since changed. Readers should verify current notifications with the relevant authority.</p>
          <p>Names of clients and associate firms are listed to describe professional relationships and remain the property of their respective owners. Submitting an enquiry through this website does not create a client relationship until an engagement is agreed in writing.</p>
          <p>{{ p.site.company.legalName }} accepts no liability for any loss arising from reliance on the content of this website.</p>
        </div>
      </section>
    } @else { <app-page-fallback [page]="page()" /> }
  `,
})
export class DisclaimerPage extends PageBase<null> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Disclaimer', href: '/disclaimer/' }];
  protected meta(site: Site) {
    return { title: 'Disclaimer', description: `Terms governing use of the ${site.company.name} website and its content.`, schema: [breadcrumbs(this.crumbs)] };
  }
}

/** Catch-all route: renders the 404 page with an HTTP 404 status. */
@Component({
  selector: 'app-not-found-page',
  imports: [NotFoundContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-not-found-content />`,
})
export class NotFoundPage {
  constructor() {
    const seo = inject(SeoService);
    inject(ApiService).site().subscribe({ next: (site) => seo.set(site, NOT_FOUND_SEO), error: () => undefined });
    seo.notFound();
  }
}
