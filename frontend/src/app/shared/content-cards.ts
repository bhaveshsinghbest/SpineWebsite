// Cards for admin-managed collections: projects and announcements / news.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../core/format';
import type { Announcement, Project, ProjectStatus } from '../core/models';
import { IconComponent } from './icon.component';

const cardHost = `:host { display: flex; } :host > * { flex: 1 1 auto; min-width: 0; }`;

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = { upcoming: 'Upcoming', ongoing: 'Ongoing', completed: 'Completed', on_hold: 'On hold' };

@Component({
  selector: 'app-project-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="tag status" [class]="'is-' + status()">{{ label() }}</span>`,
  styles: `
    .status { font-weight: 600; }
    .is-ongoing { background: #e6f4ea; color: #1e6b35; }
    .is-completed { background: var(--c-mist); color: var(--c-navy); }
    .is-upcoming { background: #fff4dc; color: #7a5200; }
    .is-on_hold { background: #f1f1f1; color: #555; }
  `,
})
export class ProjectStatusComponent {
  readonly status = input.required<ProjectStatus>();
  readonly label = computed(() => PROJECT_STATUS_LABEL[this.status()]);
}

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, IconComponent, ProjectStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card card-interactive group d-flex flex-column overflow-hidden">
      <div class="media position-relative overflow-hidden navy-field">
        @if (project().coverImageUrl) {
          <img [src]="project().coverImageUrl" alt="" class="media-img gh-zoom" loading="lazy" decoding="async" width="720" height="400" />
        } @else {
          <span class="media-icon"><span icon="apartment" [size]="56" class="text-periwinkle-70"></span></span>
        }
        @if (project().category; as c) { <span class="tag media-tag bg-navy-2 text-white">{{ c.name }}</span> }
      </div>
      <div class="d-flex flex-1 flex-column p-6">
        <div class="d-flex flex-wrap align-items-center gap-2"><app-project-status [status]="project().status" /></div>
        <h3 class="mt-3 card-title"><a [routerLink]="'/projects/' + project().slug" class="stretched">{{ project().title }}</a></h3>
        <p class="mt-2 flex-1 fs-small text-muted">{{ project().summary }}</p>
        @if (project().client || project().location) {
          <ul class="mt-4 stack-1h fs-small text-ink-2">
            @if (project().client) { <li class="d-flex align-items-start gap-2"><span icon="domain" [size]="16" class="mt-0h text-cobalt"></span>{{ project().client }}</li> }
            @if (project().location) { <li class="d-flex align-items-start gap-2"><span icon="location_on" [size]="16" class="mt-0h text-cobalt"></span>{{ project().location }}</li> }
          </ul>
        }
        <span class="mt-5 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-cobalt gh-gap-2">View project <span icon="arrow_forward" [size]="16"></span></span>
      </div>
    </article>
  `,
  styles: `${cardHost}
    .media { height: 12rem; }
    .media-img { height: 100%; width: 100%; object-fit: cover; }
    .media-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .media-tag { position: absolute; left: 0.75rem; top: 0.75rem; }
  `,
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
}

@Component({
  selector: 'app-announcement-card',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card card-interactive group d-flex flex-column overflow-hidden">
      @if (item().imageUrl) {
        <div class="media position-relative overflow-hidden navy-field">
          <img [src]="item().imageUrl" alt="" class="media-img gh-zoom" loading="lazy" decoding="async" width="720" height="400" />
        </div>
      }
      <div class="d-flex flex-1 flex-column p-6">
        <p class="eyebrow d-flex align-items-center gap-2 text-muted">
          <span class="tag tag-sm" [class.bg-amber-soft]="item().kind === 'announcement'" [class.bg-mist]="item().kind !== 'announcement'">{{ item().kind === 'announcement' ? 'Announcement' : 'News' }}</span>
          <time [attr.datetime]="item().publishedAt">{{ date() }}</time>
        </p>
        <h3 class="mt-3 card-title"><a [routerLink]="'/news/' + item().slug" class="stretched">{{ item().title }}</a></h3>
        <p class="mt-2 flex-1 fs-small text-muted">{{ item().summary }}</p>
        <span class="mt-5 d-inline-flex align-items-center gap-1 fs-sm fw-semibold text-cobalt">Read more <span icon="north_east" [size]="16"></span></span>
      </div>
    </article>
  `,
  styles: `${cardHost}
    .media { height: 11rem; }
    .media-img { height: 100%; width: 100%; object-fit: cover; }
    .tag-sm { font-size: 10px; }
    .bg-amber-soft { background: #fff4dc; color: #7a5200; }
  `,
})
export class AnnouncementCardComponent {
  readonly item = input.required<Announcement>();
  readonly date = computed(() => formatDate(this.item().publishedAt));
}
