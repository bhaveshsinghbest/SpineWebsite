import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, type Observable } from 'rxjs';
import { AdminApi } from './admin-api.service';
import type { Option } from './form-engine';

/** Option lists that come from the database, used by selects, multi-selects and suggestion lists. */
export type LookupKey = 'practices' | 'projectCategories' | 'sectors' | 'departments' | 'locations' | 'employmentTypes' | 'experienceLevels';

interface CareerOptions { departments: string[]; locations: string[]; employmentTypes: string[]; experienceLevels: string[] }
const strings = (xs: string[] | undefined): Option[] => (xs ?? []).map((v) => ({ value: v, label: v }));

@Injectable({ providedIn: 'root' })
export class LookupService {
  private api = inject(AdminApi);
  /** Loaded option lists. Reloaded after edits (see invalidate). */
  readonly options = signal<Partial<Record<LookupKey, Option[]>>>({});
  private loading = new Set<LookupKey>();

  /** Loads the given lists (once) and returns nothing; read them from `options()`. */
  load(keys: LookupKey[]) {
    const missing = keys.filter((k) => !(k in this.options()) && !this.loading.has(k));
    if (!missing.length) return;
    missing.forEach((k) => this.loading.add(k));
    const careerKeys: LookupKey[] = ['departments', 'locations', 'employmentTypes', 'experienceLevels'];
    const jobs: Record<string, Observable<Partial<Record<LookupKey, Option[]>>>> = {};
    if (missing.includes('practices')) {
      jobs['practices'] = this.api.list('practices', { pageSize: 100 }).pipe(map((r) => ({ practices: r.data.map((p) => ({ value: p['slug'], label: p['title'] })) })));
    }
    if (missing.includes('projectCategories')) {
      jobs['projectCategories'] = this.api.list('project-categories', { pageSize: 100 }).pipe(map((r) => ({ projectCategories: r.data.map((c) => ({ value: c['id'], label: c['name'] })) })));
    }
    if (missing.includes('sectors')) {
      const kindLabel: Record<string, string> = { industry: 'Industry', sector: 'Sector', pillar: 'Pillar' };
      jobs['sectors'] = this.api.list('sectors', { pageSize: 100 }).pipe(map((r) => ({ sectors: r.data.map((x) => ({ value: x['id'], label: `${x['title']} (${kindLabel[x['kind']] ?? x['kind']})` })) })));
    }
    if (missing.some((k) => careerKeys.includes(k))) {
      jobs['career'] = this.api.getContent<CareerOptions>('careerOptions').pipe(map((r) => ({
        departments: strings(r.data?.departments), locations: strings(r.data?.locations),
        employmentTypes: strings(r.data?.employmentTypes?.length ? r.data.employmentTypes : ['Full-time', 'Part-time', 'Contract', 'Internship']),
        experienceLevels: strings(r.data?.experienceLevels),
      })));
    }
    const safe = Object.fromEntries(Object.entries(jobs).map(([k, o]) => [k, o.pipe(catchError(() => of({})))]));
    forkJoin(safe).subscribe((parts) => {
      this.options.update((cur) => Object.assign({ ...cur }, ...Object.values(parts)));
      missing.forEach((k) => this.loading.delete(k));
    });
  }

  /** Forget cached lists so they are fetched again (after categories or settings change). */
  invalidate(...keys: LookupKey[]) {
    this.options.update((cur) => {
      const next = { ...cur };
      for (const k of keys) delete next[k];
      return next;
    });
  }
}
