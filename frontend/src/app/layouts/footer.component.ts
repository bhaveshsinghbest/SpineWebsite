import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Site } from '../core/models';
import { IconComponent } from '../shared/icon.component';
import { OfficeGridComponent } from '../shared/sections';
import { aboutLinks, industryLinks, serviceLinks } from './navigation';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, OfficeGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="navy-field text-periwinkle">
      <div class="wrap pb-10 pt-16">
        <div class="grid gap-12 border-bottom border-white-10 pb-12">
          <div class="g-col-12 g-col-lg-4 stack-5">
            <a routerLink="/" class="footer-brand d-flex align-items-center gap-3" [attr.aria-label]="site().company.name + ' — home'">
              <img [src]="site().company.logoWhiteUrl || '/assets/brand/logo-white.png'" alt="" class="logo" [class.as-is]="!!site().company.logoWhiteUrl" width="264" height="99" loading="lazy" />
            </a>
            <p class="mw-sm fs-small text-periwinkle-90">{{ site().footer?.about || site().company.description }}</p>
            <address class="stack-2 fs-small">
              <p class="d-flex align-items-center gap-2"><span icon="mail" [size]="16" class="text-amber-soft"></span><a class="hover-white" [href]="'mailto:' + site().company.email">{{ site().company.email }}</a></p>
              <p class="d-flex align-items-center gap-2"><span icon="call" [size]="16" class="text-amber-soft"></span><a class="hover-white" [href]="'tel:' + site().company.phoneLandlineHref">{{ site().company.phoneLandline }}</a></p>
            </address>
            @if (social().length) {
              <p class="d-flex gap-4 fs-small">
                @for (s of social(); track s.label) { <a class="hover-white" [href]="s.href" rel="noopener noreferrer" target="_blank">{{ s.label }}</a> }
              </p>
            }
          </div>
          <div class="g-col-12 g-col-lg-8 grid cols gap-8 keep-col-gap">
            @for (c of cols(); track c.title) {
              <div class="g-col-6 g-col-sm-3">
                <h2 class="eyebrow mb-4 text-white">{{ c.title }}</h2>
                <ul class="stack-2h fs-small">
                  @for (l of c.links; track l.href) { <li><a class="footer-link hover-white" [routerLink]="l.href">{{ l.label }}</a></li> }
                </ul>
              </div>
            }
          </div>
        </div>
        <div class="border-bottom border-white-10 py-10">
          <h2 class="eyebrow mb-4 text-white">Our offices</h2>
          <app-office-grid [offices]="site().offices" tone="dark" [cols4]="true" />
        </div>
        <div class="d-flex flex-column align-items-start justify-content-between gap-4 pt-8 fs-small text-periwinkle-80 flex-md-row align-items-md-center">
          <div class="stack-1">
            <p>{{ copyright() }}</p>
            @if (site().footer?.note) { <p class="text-periwinkle-70">{{ site().footer?.note }}</p> }
          </div>
          <div class="d-flex flex-wrap gap-6">
            <a class="hover-white" routerLink="/disclaimer">Disclaimer</a>
            <a class="hover-white" routerLink="/privacy">Privacy Policy</a>
            <a class="hover-white" href="/sitemap.xml">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    :host { display: block; }
    .logo { height: 2.25rem; width: auto; filter: brightness(0) invert(1); }
    .logo.as-is { filter: none; }
    .footer-brand { width: fit-content; }
    .cols { --bs-columns: 12; }
    .footer-link { transition: color 150ms ease, padding-left 150ms ease; }
    .footer-link:hover { padding-left: 0.25rem; }
  `,
})
export class FooterComponent {
  readonly site = input.required<Site>();
  readonly year = new Date().getFullYear();
  /** Footer copyright line (Website Settings); {year} is replaced with the current year. */
  readonly copyright = computed(() => {
    const custom = this.site().footer?.copyright;
    return custom ? custom.replace(/{year}/g, String(this.year)) : `© ${this.year} ${this.site().company.legalName}. All rights reserved.`;
  });
  readonly social = computed(() =>
    [
      { label: 'LinkedIn', href: this.site().company.social?.linkedin }, { label: 'X', href: this.site().company.social?.x },
      { label: 'Facebook', href: this.site().company.social?.facebook }, { label: 'Instagram', href: this.site().company.social?.instagram },
      { label: 'YouTube', href: this.site().company.social?.youtube },
    ].filter((s) => !!s.href) as { label: string; href: string }[],
  );
  readonly cols = computed(() => {
    const s = this.site();
    return [
      { title: 'About Us', links: aboutLinks },
      { title: 'Services', links: serviceLinks(s) },
      { title: 'Industries & Sectors', links: [...industryLinks(s), { label: 'Infrastructure Sectors', href: '/sectors' }, { label: 'Strategic Pillars', href: '/strategic-pillars' }] },
      {
        title: 'Company',
        links: [
          { label: 'Projects', href: '/projects' }, { label: 'Clientele', href: '/clientele' }, { label: 'Career', href: '/careers' }, { label: 'Association', href: '/association' },
          { label: 'Testimonials', href: '/testimonials' }, { label: 'News', href: '/news' }, { label: 'Insights', href: '/insights' }, { label: 'FAQs', href: '/faq' }, { label: 'Contact Us', href: '/contact' },
        ],
      },
    ];
  });
}
