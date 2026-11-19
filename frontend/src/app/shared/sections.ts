// Recurring page sections: FAQ accordion, call-to-action band, office grid, client wordmarks,
// leader portrait and the in-section tab bar.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { initials, officeAddress, officeMapsUrl } from '../core/format';
import type { Faq, Leader, Office, Site } from '../core/models';
import { IconComponent } from './icon.component';

/** Visible FAQ accordion. The matching FAQPage JSON-LD is added by the page. */
@Component({
  selector: 'app-faq-section',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white py-20" aria-labelledby="faq-title">
      <div class="wrap grid gap-10">
        <div class="g-col-12 g-col-lg-4">
          <p class="eyebrow text-cobalt">{{ eyebrow() }}</p>
          <h2 id="faq-title" class="mt-2 serif-h1">{{ title() }}</h2>
          <p class="mt-3 text-muted">Can’t find what you need? <a class="fw-semibold text-cobalt hover-underline" routerLink="/contact">Speak with a partner</a>.</p>
        </div>
        <div class="g-col-12 g-col-lg-8 divide-y border-top border-bottom">
          @for (f of faqs(); track f.q; let i = $index) {
            <details class="py-5" [open]="i === 0">
              <summary class="d-flex no-marker align-items-start justify-content-between gap-6 text-start">
                <h3 class="card-title">{{ f.q }}</h3>
                <span icon="expand_more" [size]="24" class="mt-0h text-cobalt open-rotate"></span>
              </summary>
              <p class="mt-3 mw-3xl fs-prose lh-relaxed text-ink-2">{{ f.a }}</p>
            </details>
          }
        </div>
      </div>
    </section>
  `,
  styles: `:host { display: block; }`,
})
export class FaqSectionComponent {
  readonly faqs = input.required<Faq[]>();
  readonly title = input('Frequently asked questions');
  readonly eyebrow = input('Answers');
}

@Component({
  selector: 'app-cta-band',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="navy-field text-white">
      <div class="wrap grid gap-8 align-items-center py-16">
        <div class="g-col-12 g-col-lg-8">
          <p class="eyebrow text-amber-soft">Confidential briefing</p>
          <h2 class="mt-2 section-title text-white">{{ title() }}</h2>
          <p class="mt-3 mw-2xl text-periwinkle">{{ text() }}</p>
        </div>
        <div class="g-col-12 g-col-lg-4 d-flex flex-wrap gap-3 justify-content-lg-end">
          <a routerLink="/contact" class="btn btn-amber"><span icon="event_available" [size]="18"></span> Schedule a Briefing</a>
          @if (phoneHref()) { <a [href]="'tel:' + phoneHref()" class="btn btn-ghost-dark"><span icon="call" [size]="18"></span> Call Us</a> }
        </div>
      </div>
    </section>
  `,
  styles: `:host { display: block; }`,
})
export class CtaBandComponent {
  readonly title = input('Discuss your mandate with a partner');
  readonly text = input('Briefings are held in confidence with Principal Secretaries, project directors, boards and promoter teams. We respond to official enquiries within one working day.');
  readonly phoneHref = input<string | undefined>();
}

/** The firm's offices. `tone="dark"` on navy backgrounds (footer). */
@Component({
  selector: 'app-office-grid',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="tile-grid offices" [class.on-dark]="dark()" [class.cols-lg-4]="cols4()">
      @for (o of offices(); track o.city) {
        <li class="d-flex flex-column p-5" [class.bg-navy]="dark()" [class.bg-white]="!dark()">
          <p class="eyebrow" [class.text-amber-soft]="dark()" [class.text-cobalt]="!dark()">{{ o.headOffice ? 'Head office' : 'Regional office' }}</p>
          <p class="mt-1 font-serif fs-h3 fw-semibold" [class.text-white]="dark()" [class.text-ink]="!dark()">{{ o.city }}</p>
          <p class="mt-1 flex-1 fs-small" [class.text-periwinkle-90]="dark()" [class.text-muted]="!dark()">{{ o.lines.length ? address(o) : o.region + ', India' }}</p>
          @if (o.lines.length) {
            <a [href]="maps(o)" target="_blank" rel="noopener" class="mt-3 d-inline-flex align-items-center gap-1 fs-small fw-semibold"
               [class.text-white]="dark()" [class.dir-dark]="dark()" [class.text-cobalt]="!dark()" [class.hover-underline]="!dark()">
              Directions <span icon="arrow_outward" [size]="14"></span>
            </a>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    :host { display: block; }
    .offices { grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 640px) { .offices { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (min-width: 1024px) { .offices.cols-lg-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    .dir-dark:hover { color: var(--c-amber-soft) !important; }
  `,
})
export class OfficeGridComponent {
  readonly offices = input.required<Office[]>();
  readonly tone = input<'light' | 'dark'>('light');
  readonly cols4 = input(false);
  readonly dark = computed(() => this.tone() === 'dark');
  address = (o: Office) => officeAddress(o);
  maps = (o: Office) => officeMapsUrl(o);
}

/** Client wordmarks (logos are not used without permission). */
@Component({
  selector: 'app-client-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="tile-grid clients">
      @for (c of clients(); track c.name) {
        <li class="client d-flex flex-column align-items-center justify-content-center bg-white px-4 py-7 text-center" [attr.title]="c.name">
          @if (c.logoUrl) { <img [src]="c.logoUrl" [alt]="c.name" class="client-logo" loading="lazy" /> }
          @else { <span class="wordmark">{{ c.short }}</span> }
          <span class="mt-1 client-name">{{ c.name }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host { display: block; }
    .clients { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 640px) { .clients { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    .wordmark { font-size: 1.15rem; font-weight: 700; letter-spacing: 0.12em; color: var(--c-muted); transition: color 150ms ease; }
    .client:hover .wordmark { color: var(--c-navy); }
    .client-name { font-size: 11px; color: rgb(100 116 139 / 0.8); }
    .client-logo { max-height: 2.5rem; width: auto; filter: grayscale(1); }
  `,
})
export class ClientBarComponent {
  readonly clients = input.required<Site['clients']>();
}

/** Headshot, or a monogram plate until a photo is uploaded. */
@Component({
  selector: 'app-leader-portrait',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="portrait position-relative overflow-hidden" [class.rounded]="!square()">
      @if (leader().photo) {
        <img [src]="leader().photo" [alt]="leader().name + ', ' + leader().role + ', Spine Advisory'" class="photo" [attr.loading]="eager() ? 'eager' : 'lazy'" width="1024" height="1024" />
      } @else {
        <div class="navy-field monogram d-flex h-100 w-100 align-items-center justify-content-center" role="img" [attr.aria-label]="leader().name + ' — photograph to follow'">
          <span class="font-serif fw-semibold lh-none letters" [style.font-size]="monogramSize()">{{ letters() }}</span>
          <span class="accent"></span>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .portrait { aspect-ratio: 4 / 5; background: var(--c-navy); }
    .photo { height: 100%; width: 100%; object-fit: cover; object-position: top; }
    .letters { color: rgb(185 199 228 / 0.8); }
    .accent { position: absolute; bottom: 0; left: 0; height: 0.25rem; width: 33.333%; background: var(--c-amber); }
  `,
})
export class LeaderPortraitComponent {
  readonly leader = input.required<Leader>();
  readonly eager = input(false);
  readonly square = input(false);
  readonly monogramSize = input('5.5rem');
  readonly letters = computed(() => initials(this.leader().name));
}

/** Sticky in-section tabs (About Us → Overview / Mission / Vision / Team). */
@Component({
  selector: 'app-sub-nav',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="subnav border-bottom bg-white-95 blur-backdrop" [attr.aria-label]="label()">
      <div class="wrap">
        <ul class="no-scrollbar d-flex gap-1 overflow-x-auto tabs">
          @for (l of links(); track l.href) {
            <li class="flex-shrink-0">
              <a [routerLink]="l.href" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page"
                 class="tab d-flex align-items-center gap-2 px-3 py-4 fs-sm fw-medium">
                @if (l.icon) { <span [icon]="l.icon" [size]="18" class="tab-icon"></span> }
                {{ l.label }}
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
  styles: `
    :host { display: block; position: sticky; top: var(--header-h); z-index: 30; }
    .subnav { background: rgb(255 255 255 / 0.95); }
    .tabs { margin-inline: -0.25rem; }
    .tab { border-bottom: 2px solid transparent; color: var(--c-muted); transition: color 150ms ease; }
    .tab:hover { color: var(--c-navy); }
    .tab .tab-icon { color: var(--c-cobalt); }
    .tab.active { border-bottom-color: var(--c-amber); color: var(--c-navy); }
    .tab.active .tab-icon { color: var(--c-amber); }
  `,
})
export class SubNavComponent {
  readonly links = input.required<{ label: string; href: string; icon?: string }[]>();
  readonly label = input.required<string>();
}
