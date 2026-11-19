import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface ListMeta { page: number; pageSize: number; total: number; pages: number; [extra: string]: unknown }
export interface ListResult<T = Record<string, any>> { data: T[]; meta: ListMeta }
type Query = Record<string, string | number | undefined | null>;

const params = (query: Query) => {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
  return p;
};

/** Thin client for /api/admin. Session cookie and CSRF header are added by adminApiInterceptor. */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);
  private base = '/api/admin';

  list<T = Record<string, any>>(resource: string, query: Query = {}) {
    return this.http.get<ListResult<T>>(`${this.base}/${resource}`, { params: params(query) });
  }
  get<T = Record<string, any>>(resource: string, id: number | string) { return this.http.get<T>(`${this.base}/${resource}/${id}`); }
  create<T = Record<string, any>>(resource: string, body: unknown) { return this.http.post<T>(`${this.base}/${resource}`, body); }
  update<T = Record<string, any>>(resource: string, id: number | string, body: unknown) { return this.http.put<T>(`${this.base}/${resource}/${id}`, body); }
  patch<T = Record<string, any>>(resource: string, id: number | string, body: unknown) { return this.http.patch<T>(`${this.base}/${resource}/${id}`, body); }
  /** Quick publication change: publish, unpublish, archive, close … */
  setStatus<T = Record<string, any>>(resource: string, id: number | string, status: string) { return this.http.patch<T>(`${this.base}/${resource}/${id}/status`, { status }); }
  remove(resource: string, id: number | string) { return this.http.delete<void>(`${this.base}/${resource}/${id}`); }
  /** CSV export of the current filters (enquiries, applications). */
  exportCsv(resource: string, query: Query = {}) {
    return this.http.get(`${this.base}/${resource}/export`, { params: params(query), responseType: 'blob', observe: 'response' });
  }

  getContent<T = unknown>(key: string) { return this.http.get<{ key: string; data: T | null; updatedAt: string | null }>(`${this.base}/content/${key}`); }
  saveContent(key: string, data: unknown) { return this.http.put<{ key: string; data: unknown; updatedAt: string }>(`${this.base}/content/${key}`, { data }); }

  dashboard() { return this.http.get<Dashboard>(`${this.base}/dashboard`); }

  upload(file: File, kind: 'image' | 'document', alt?: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    if (alt) fd.append('alt', alt);
    return this.http.post<{ id: number; url: string; originalName: string }>(`${this.base}/media`, fd);
  }

  downloadCv(id: number) { return this.http.get(`${this.base}/applications/${id}/cv`, { responseType: 'blob', observe: 'response' }); }
}

export interface Dashboard {
  stats: {
    visitors: number; visitorsThisMonth: number; pageViews: number; enquiries: number; enquiriesNew: number; enquiriesThisMonth: number;
    activeProjects: number; projectsTotal: number; publishedProjects: number; publishedAnnouncements: number; scheduledAnnouncements: number;
    jobsOpen: number; applicationsPending: number; applicationsTotal: number;
  };
  monthly: { month: string; visitors: number; enquiries: number }[];
  projectStatus: Record<'upcoming' | 'ongoing' | 'completed' | 'on_hold', number>;
  recentActivity: { id: number; action: string; entity: string; summary: string | null; createdAt: string; user: string | null }[];
  recentEnquiries: { id: number; name: string; organisation: string; status: string; createdAt: string }[];
  topPages: { path: string; views: number }[];
}
