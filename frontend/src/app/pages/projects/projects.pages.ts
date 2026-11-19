import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/format';
import type { Project, ProjectList, ProjectStatus, Site } from '../../core/models';
import { abs, breadcrumbs } from '../../core/schema';
import { PROJECT_STATUS_LABEL, ProjectCardComponent, ProjectStatusComponent } from '../../shared/content-cards';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { CtaBandComponent } from '../../shared/sections';

const SHARED = [RouterLink, IconComponent, PageHeroComponent, ProjectCardComponent, ProjectStatusComponent, CtaBandComponent, PageFallbackComponent, ...MOTION];
const STATUSES: ProjectStatus[] = ['ongoing', 'completed', 'upcoming', 'on_hold'];

/** /projects: published projects, filterable by status and category. Managed in Admin Panel → Project Management. */
@Component({
  selector: 'app-projects-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      <app-page-hero eyebrow="Our work" title="Projects" [content]="p.site.pages?.['projects']"
        lead="Infrastructure and industry mandates Spine Advisory has structured, financed and helped deliver — from feasibility to commercial operation."
        banner="highway-mountains" [crumbs]="crumbs" />
      <section class="py-16 py-lg-20">
        <div class="wrap stack-10">
          @if (p.data.data.length) {
            <div class="d-flex flex-column gap-4 flex-lg-row align-items-lg-center justify-content-between">
              <div class="d-flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                <button type="button" class="btn btn-compact" [class.btn-primary]="!status()" [class.btn-outline]="!!status()" [attr.aria-pressed]="!status()" (click)="status.set('')">All ({{ p.data.data.length }})</button>
                @for (s of statuses(); track s.value) {
                  <button type="button" class="btn btn-compact" [class.btn-primary]="status() === s.value" [class.btn-outline]="status() !== s.value" [attr.aria-pressed]="status() === s.value" (click)="status.set(s.value)">{{ s.label }} ({{ s.count }})</button>
                }
              </div>
              @if (p.data.categories.length > 1) {
                <label class="d-flex align-items-center gap-2 fs-small text-muted">
                  Category
                  <select class="form-select select-compact" [value]="category()" (change)="category.set($any($event.target).value)">
                    <option value="">All categories</option>
                    @for (c of p.data.categories; track c.slug) { <option [value]="c.slug">{{ c.name }}</option> }
                  </select>
                </label>
              }
            </div>
            <div class="grid gap-8" revealGroup>
              @for (pr of shown(); track pr.slug) { <app-project-card [project]="pr" class="g-col-12 g-col-md-6 g-col-lg-4" /> }
            </div>
            @if (!shown().length) {
              <p class="text-center text-muted">No projects match these filters. <button type="button" class="btn-link-reset text-cobalt fw-semibold" (click)="status.set(''); category.set('')">Show all projects</button></p>
            }
          } @else {
            <div class="card mx-auto mw-2xl p-8 text-center">
              <span class="icon-tile square-14 mx-auto bg-mist text-cobalt"><span icon="apartment" [size]="28"></span></span>
              <h2 class="mt-6 serif-h2">Project portfolio coming soon</h2>
              <p class="mt-3 text-muted">Details of our mandates are being prepared for publication. To discuss our experience on a specific type of project, talk to the team.</p>
              <a routerLink="/contact" class="btn btn-primary mt-6 mx-auto">Contact us</a>
            </div>
          }
        </div>
      </section>
      <app-cta-band title="Have a project that needs structuring, finance or independent review?" [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `
    :host { display: block; }
    .select-compact { width: auto; min-width: 14rem; padding-block: 0.45rem; }
    .btn-link-reset { background: none; border: 0; padding: 0; text-decoration: underline; }
  `,
})
export class ProjectsPage extends PageBase<ProjectList> {
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }];
  readonly status = signal<ProjectStatus | ''>('');
  readonly category = signal('');
  readonly statuses = computed(() => {
    const all = this.ok()?.data.data ?? [];
    return STATUSES.map((value) => ({ value, label: PROJECT_STATUS_LABEL[value], count: all.filter((x) => x.status === value).length })).filter((x) => x.count > 0);
  });
  readonly shown = computed(() =>
    (this.ok()?.data.data ?? []).filter((x) => (!this.status() || x.status === this.status()) && (!this.category() || x.category?.slug === this.category())),
  );
  protected meta(site: Site, d: ProjectList) {
    return {
      title: site.pages?.['projects']?.title || 'Projects',
      description: 'Infrastructure and industry projects advised by Spine Advisory: transaction advisory, project finance, independent engineering and risk across India.',
      schema: [
        breadcrumbs(this.crumbs),
        { '@type': 'CollectionPage', name: 'Projects', hasPart: d.data.map((x) => ({ '@type': 'CreativeWork', name: x.title, url: abs(`/projects/${x.slug}/`) })) },
      ],
    };
  }
}

export interface ProjectData { project: Project; related: Project[] }

/** /projects/:slug */
@Component({
  selector: 'app-project-page',
  imports: SHARED,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ok(); as p) {
      @let pr = p.data.project;
      <app-page-hero [eyebrow]="pr.category?.name ?? 'Project'" [title]="pr.title" [lead]="pr.summary" [crumbs]="crumbs()">
        <div class="d-flex flex-wrap align-items-center gap-3 pt-2"><app-project-status [status]="pr.status" /></div>
      </app-page-hero>

      <section class="py-16 py-lg-20">
        <div class="wrap grid gap-12">
          <article class="g-col-12 g-col-lg-8 stack-8">
            @if (pr.coverImageUrl) { <img [src]="pr.coverImageUrl" [alt]="pr.title" class="cover rounded" width="1200" height="675" /> }
            @if (pr.description.length) {
              <div class="prose-spine">@for (para of pr.description; track $index) { <p>{{ para }}</p> }</div>
            }
            @if (pr.highlights.length) {
              <div class="card border-accent-left p-6 p-md-8">
                <p class="eyebrow d-flex align-items-center gap-2 text-amber"><span icon="lightbulb" [size]="16"></span> Key details</p>
                <ul class="mt-3 stack-2">
                  @for (h of pr.highlights; track $index) { <li class="d-flex align-items-start gap-2"><span icon="check_circle" [size]="18" class="mt-0h text-cobalt"></span>{{ h }}</li> }
                </ul>
              </div>
            }
            @if (pr.images.length) {
              <section aria-labelledby="gallery">
                <h2 id="gallery" class="serif-h2">Project gallery</h2>
                <div class="mt-6 grid gap-4 keep-col-gap">
                  @for (img of pr.images; track img.url) {
                    <figure class="g-col-12 g-col-sm-6 m-0">
                      <a [href]="img.url" target="_blank" rel="noopener"><img [src]="img.url" [alt]="img.caption ?? pr.title" class="gallery-img rounded" loading="lazy" width="600" height="400" /></a>
                      @if (img.caption) { <figcaption class="mt-2 fs-small text-muted">{{ img.caption }}</figcaption> }
                    </figure>
                  }
                </div>
              </section>
            }
          </article>
          <aside class="g-col-12 g-col-lg-4">
            <div class="sticky-panel stack-6">
              <dl class="card p-6 stack-4 m-0">
                @for (f of facts(); track f.label) {
                  <div><dt class="eyebrow text-muted">{{ f.label }}</dt><dd class="mt-1 mb-0 text-ink">{{ f.value }}</dd></div>
                }
                @if (pr.sector; as s) {
                  <div><dt class="eyebrow text-muted">Sector</dt><dd class="mt-1 mb-0"><a [routerLink]="s.href" class="text-cobalt fw-semibold">{{ s.title }}</a></dd></div>
                }
              </dl>
              <div class="navy-field rounded p-6 text-white">
                <p class="eyebrow text-amber-soft">Similar mandate?</p>
                <p class="mt-2 font-serif fs-h3">Talk to the team that delivered it.</p>
                <a routerLink="/contact" class="btn btn-amber mt-5 w-100">Schedule a Briefing</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
      @if (p.data.related.length) {
        <section class="bg-mist py-16">
          <div class="wrap">
            <h2 class="serif-h2">Related projects</h2>
            <div class="mt-8 grid gap-8">
              @for (r of p.data.related; track r.slug) { <app-project-card [project]="r" class="g-col-12 g-col-md-4" /> }
            </div>
          </div>
        </section>
      }
      <app-cta-band [phoneHref]="p.site.company.phoneLandlineHref" />
    } @else { <app-page-fallback [page]="page()" /> }
  `,
  styles: `
    :host { display: block; }
    .cover { width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; }
    .gallery-img { width: 100%; height: 14rem; object-fit: cover; }
  `,
})
export class ProjectPage extends PageBase<ProjectData> {
  readonly crumbs = computed(() => {
    const pr = this.ok()?.data.project;
    return [{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }, ...(pr ? [{ name: pr.title, href: `/projects/${pr.slug}/` }] : [])];
  });
  readonly facts = computed(() => {
    const pr = this.ok()?.data.project;
    if (!pr) return [];
    const period = [pr.startedOn && formatDate(pr.startedOn), pr.completedOn && formatDate(pr.completedOn)].filter(Boolean).join(' – ');
    return [
      { label: 'Client', value: pr.client }, { label: 'Location', value: pr.location }, { label: 'Project value', value: pr.value },
      { label: pr.completedOn ? 'Period' : 'Started', value: period }, { label: 'Status', value: PROJECT_STATUS_LABEL[pr.status] },
      { label: 'Category', value: pr.category?.name },
    ].filter((f) => !!f.value) as { label: string; value: string }[];
  });
  protected meta(_s: Site, d: ProjectData) {
    const pr = d.project;
    return {
      title: pr.title,
      description: pr.summary.slice(0, 160),
      image: pr.coverImageUrl,
      schema: [breadcrumbs(this.crumbs()), { '@type': 'CreativeWork', name: pr.title, description: pr.summary, url: abs(`/projects/${pr.slug}/`) }],
    };
  }
}
