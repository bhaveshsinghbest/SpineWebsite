// Module shells (heading + tabs + child page) and the Website Content Management overview.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from './ui';

export interface ModuleTab { label: string; path: string; icon?: string; exact?: boolean }

/** A module page with a heading and tab navigation; the selected tab renders in the outlet. */
@Component({
  selector: 'app-module-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title()" [subtitle]="subtitle()" />
    <nav class="module-tabs mb-3" [attr.aria-label]="title() + ' sections'">
      @for (t of tabs(); track t.path) {
        <a [routerLink]="t.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !!t.exact }" class="module-tab">
          @if (t.icon) { <span class="icon" aria-hidden="true">{{ t.icon }}</span> }{{ t.label }}
        </a>
      }
    </nav>
    <router-outlet />
  `,
})
export class ModuleShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly tabs = input.required<ModuleTab[]>();
}

interface CmsCard { label: string; text: string; icon: string; href: string }

/** Website Content Management: what can be edited, without code changes. */
@Component({
  selector: 'app-cms-overview',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (g of groups; track g.title) {
      <h2 class="h6 text-uppercase text-muted small fw-bold mt-4 mb-2 letter-spaced">{{ g.title }}</h2>
      <div class="row g-3">
        @for (c of g.cards; track c.href) {
          <div class="col-sm-6 col-xl-4">
            <a [routerLink]="c.href" class="card cms-card h-100 text-decoration-none">
              <div class="card-body d-flex gap-3">
                <span class="stat-icon tone-navy"><span class="icon" aria-hidden="true">{{ c.icon }}</span></span>
                <span><span class="d-block fw-semibold text-body">{{ c.label }}</span><span class="d-block small text-muted">{{ c.text }}</span></span>
              </div>
            </a>
          </div>
        }
      </div>
    }
  `,
})
export class CmsOverviewPage {
  readonly groups: { title: string; cards: CmsCard[] }[] = [
    {
      title: 'Homepage & headings',
      cards: [
        { label: 'Homepage', text: 'Hero heading and text, banner image, promotional section and section headings.', icon: 'home', href: '/admin/content/home' },
        { label: 'Page headings', text: 'Banner heading and introduction of each main page.', icon: 'title', href: '/admin/content/pages' },
        { label: 'Headline figures', text: 'Figures in the homepage hero and Overview page.', icon: 'monitoring', href: '/admin/content/blocks/stats' },
        { label: 'Why choose Spine', text: 'Reasons shown on the homepage.', icon: 'thumb_up', href: '/admin/content/blocks/whyChoose' },
      ],
    },
    {
      title: 'About Us & company profile',
      cards: [
        { label: 'Company overview', text: 'The company profile paragraphs on About Us.', icon: 'domain', href: '/admin/content/blocks/overview' },
        { label: 'Mission', text: 'Mission statement, description and objectives.', icon: 'flag', href: '/admin/content/blocks/mission' },
        { label: 'Vision', text: 'Vision statement and points.', icon: 'visibility', href: '/admin/content/blocks/vision' },
        { label: 'Values', text: 'Value cards on the Mission page.', icon: 'diamond', href: '/admin/content/blocks/values' },
        { label: 'Our approach', text: 'The seven-step approach.', icon: 'route', href: '/admin/content/blocks/approach' },
        { label: 'Team', text: 'Leadership profiles and photographs.', icon: 'groups', href: '/admin/content/r/team' },
      ],
    },
    {
      title: 'Services, sectors & credentials',
      cards: [
        { label: 'Services', text: 'Service practices and service descriptions (add and update).', icon: 'handshake', href: '/admin/content/r/practices' },
        { label: 'Industries & sectors', text: 'Industry, sector and strategic-pillar pages.', icon: 'factory', href: '/admin/content/r/sectors' },
        { label: 'Clients', text: 'Clientele list and logos.', icon: 'workspace_premium', href: '/admin/content/r/clients' },
        { label: 'Associates', text: 'Associate firms.', icon: 'hub', href: '/admin/content/r/associates' },
        { label: 'Testimonials', text: 'Client testimonials (with written consent).', icon: 'format_quote', href: '/admin/content/r/testimonials' },
        { label: 'Insights', text: 'Policy briefs and articles.', icon: 'description', href: '/admin/content/r/articles' },
      ],
    },
    {
      title: 'Media & technical',
      cards: [
        { label: 'Media library', text: 'Upload and manage images and documents.', icon: 'photo_library', href: '/admin/content/media' },
        { label: 'Redirects', text: 'Old web addresses that forward to current pages.', icon: 'link', href: '/admin/content/r/redirects' },
      ],
    },
  ];
}
