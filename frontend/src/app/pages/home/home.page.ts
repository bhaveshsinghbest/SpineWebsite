import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import type { Announcement, Article, Faq, JobOpening, Practice, Project, Sector, Site, Testimonial } from '../../core/models';
import { HOME_DEFAULTS, HOME_SECTION_DEFAULTS, fillTokens, pick } from '../../core/content-defaults';
import { pageResolver } from '../../core/page-data';
import { pad2 } from '../../core/format';
import { faqPage } from '../../core/schema';
import { BannerImageComponent } from '../../shared/banner-image.component';
import { BriefingFormComponent } from '../../shared/briefing-form.component';
import { ArticleCardComponent, PracticeCardComponent, SectorCardComponent, TestimonialCardComponent } from '../../shared/cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { SectionHeaderComponent } from '../../shared/section-header.component';
import { ClientBarComponent, FaqSectionComponent, LeaderPortraitComponent, OfficeGridComponent } from '../../shared/sections';
import { AnnouncementCardComponent, ProjectCardComponent } from '../../shared/content-cards';

export interface HomeData {
  practices: Practice[]; sectors: Sector[]; industries: Sector[]; articles: Article[]; testimonials: Testimonial[]; jobs: JobOpening[];
  /** Featured, published projects (Admin Panel → Project Management). */
  projects: Project[];
  /** Published announcements marked for the homepage (Admin Panel → Announcements & News). */
  news: Announcement[];
}

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink, IconComponent, BannerImageComponent, SectionHeaderComponent, SectorCardComponent, PracticeCardComponent, ArticleCardComponent,
    TestimonialCardComponent, ProjectCardComponent, AnnouncementCardComponent, ClientBarComponent, LeaderPortraitComponent, FaqSectionComponent, OfficeGridComponent, BriefingFormComponent,
    PageFallbackComponent, ...MOTION,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage extends PageBase<HomeData> {
  readonly pad2 = pad2;
  /** Hero text and banner: edited in Admin Panel → Website Content Management → Homepage; empty uses the built-in wording. */
  readonly hero = computed(() => {
    const site = this.ok()?.site;
    const h = site?.home ?? {};
    const vars = { founded: site?.company.founded, offices: site?.offices.length };
    return {
      eyebrow: fillTokens(pick(h.heroEyebrow, HOME_DEFAULTS.heroEyebrow), vars),
      title: pick(h.heroTitle, HOME_DEFAULTS.heroTitle),
      lead: pick(h.heroLead, HOME_DEFAULTS.heroLead),
      primary: pick(h.heroPrimaryLabel, HOME_DEFAULTS.heroPrimaryLabel),
      secondary: pick(h.heroSecondaryLabel, HOME_DEFAULTS.heroSecondaryLabel),
      image: h.heroImage || null,
    };
  });
  /** Promotional band (shown only when enabled in the Admin Panel). */
  readonly promo = computed(() => {
    const pr = this.ok()?.site.home?.promo;
    return pr?.enabled && pr.title ? pr : null;
  });
  /** A homepage section heading with its built-in fallback. */
  sec(key: keyof typeof HOME_SECTION_DEFAULTS) {
    const site = this.ok()?.site;
    const d = HOME_SECTION_DEFAULTS[key];
    const o = site?.home?.sections?.[key] ?? {};
    const vars = { founded: site?.company.founded, offices: site?.offices.length };
    return { eyebrow: fillTokens(pick(o.eyebrow, d.eyebrow), vars), title: fillTokens(pick(o.title, d.title), vars), lead: fillTokens(pick(o.lead, d.lead), vars) || undefined };
  }
  isExternal = (href: string) => /^https:\/\//.test(href);
  readonly totalServices = computed(() => this.ok()?.data.practices.reduce((n, p) => n + p.items.length, 0) ?? 0);
  readonly testimonials = computed(() => this.ok()?.data.testimonials.slice(0, 3) ?? []);
  readonly quickLinks = computed(() => {
    const p = this.ok();
    if (!p) return [];
    return [
      { icon: 'domain', label: 'About Us', text: 'Who we are', href: '/about' },
      { icon: 'handshake', label: 'Services', text: `${this.totalServices()} services`, href: '/services' },
      { icon: 'factory', label: 'Industries', text: `${p.data.industries.length} industries`, href: '/industries' },
      { icon: 'call', label: 'Contact Us', text: 'Get in touch', href: '/contact' },
    ];
  });
  readonly faqs = computed<Faq[]>(() => {
    const p = this.ok();
    return p ? homeFaqs(p.site, p.data.practices.length) : [];
  });

  protected meta(site: Site, data: HomeData) {
    return {
      title: 'Home',
      description: "Spine Advisory: transaction advisory, investment banking, engineering and risk advisory for India's infrastructure, manufacturing, real estate and logistics. Since 2010.",
      schema: [faqPage(homeFaqs(site, data.practices.length))],
    };
  }
}

function homeFaqs(site: Site, practiceCount: number): Faq[] {
  const c = site.company;
  const cities = site.offices.map((o) => o.city).join(', ');
  return [
    {
      q: 'What does Spine Advisory do?',
      a: `Spine Advisory is an Indian advisory firm, with offices in ${cities}, that structures, finances and helps deliver infrastructure and industry projects. Its ${practiceCount} practices — consulting, operation and risk advisory, investment banking, engineering services and information technology — serve government authorities, developers and enterprises across highways, ports, railways, metro, urban infrastructure, manufacturing, real estate and logistics.`,
    },
    {
      q: 'Who are Spine Advisory’s clients?',
      a: `Spine Advisory serves central and state government authorities, public sector undertakings, infrastructure developers, EPC contractors and investors. Its clients include ${site.clients.map((x) => x.name.replace(/ (Ltd\.|Pvt\. Ltd\.|\(P\) Ltd\.)$/, '').replace(/ Ltd\.$/, '')).join(', ').replace(/, ([^,]*)$/, ' and $1')}.`,
    },
    {
      q: 'What is infrastructure transaction advisory?',
      a: 'Infrastructure transaction advisory is the work of preparing a project for private participation and carrying it to award: feasibility and financial modelling, choosing the PPP model (such as HAM, BOT or DBFOT), drafting bid documents and concession agreements, running the bid process and supporting financial close. Spine Advisory provides it end to end.',
    },
    {
      q: 'How do I engage Spine Advisory?',
      a: `Submit the briefing form on this website, email ${c.email} or call ${c.phoneLandline}. A partner reviews every enquiry within one working day, arranges a confidential briefing and then shares a scoped proposal covering team, timeline and fees.`,
    },
  ];
}
