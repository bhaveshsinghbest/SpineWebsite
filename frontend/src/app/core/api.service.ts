import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import type { Announcement, Article, FaqGroup, JobOpening, Leader, Paged, Practice, Project, ProjectList, Sector, SectorKind, Site, Testimonial } from './models';

const COLLECTION: Record<SectorKind, string> = { sector: 'sectors', industry: 'industries', pillar: 'strategic-pillars' };

/** Public website API. All requests are relative (/api/...): same-origin in the browser, proxied on the server. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private site$?: Observable<Site>;

  site(): Observable<Site> {
    return (this.site$ ??= this.http.get<Site>('/api/site').pipe(shareReplay({ bufferSize: 1, refCount: false })));
  }
  /** Drop cached site data (e.g. after an admin edit in the same tab). */
  refreshSite() { this.site$ = undefined; }

  practices = () => this.http.get<Practice[]>('/api/practices');
  practice = (slug: string) => this.http.get<Practice>(`/api/practices/${encodeURIComponent(slug)}`);
  sectors = (kind: SectorKind) => this.http.get<Sector[]>(`/api/collections/${COLLECTION[kind]}`);
  sector = (kind: SectorKind, slug: string) => this.http.get<Sector>(`/api/collections/${COLLECTION[kind]}/${encodeURIComponent(slug)}`);
  teamMember = (slug: string) => this.http.get<Leader>(`/api/team/${encodeURIComponent(slug)}`);
  articles = (page = 1, pageSize = 12, category?: string) => {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (category) params = params.set('category', category);
    return this.http.get<Paged<Article>>('/api/articles', { params });
  };
  article = (slug: string) => this.http.get<Article>(`/api/articles/${encodeURIComponent(slug)}`);
  faqs = () => this.http.get<FaqGroup[]>('/api/faqs');
  jobs = () => this.http.get<JobOpening[]>('/api/jobs');
  testimonials = () => this.http.get<Testimonial[]>('/api/testimonials');
  projects = () => this.http.get<ProjectList>('/api/projects');
  project = (slug: string) => this.http.get<{ project: Project; related: Project[] }>(`/api/projects/${encodeURIComponent(slug)}`);
  announcements = (page = 1, pageSize = 12, opts: { kind?: string; homepage?: boolean } = {}) => {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (opts.kind) params = params.set('kind', opts.kind);
    if (opts.homepage) params = params.set('homepage', '1');
    return this.http.get<Paged<Announcement>>('/api/announcements', { params });
  };
  announcement = (slug: string) => this.http.get<{ item: Announcement; more: Announcement[] }>(`/api/announcements/${encodeURIComponent(slug)}`);

  submitEnquiry = (body: Record<string, unknown>) => this.http.post<{ ok: boolean; reference?: number }>('/api/enquiries', body);
  submitApplication = (body: FormData) => this.http.post<{ ok: boolean; reference?: number }>('/api/applications', body);
}
