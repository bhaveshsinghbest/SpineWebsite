// A small declarative form engine for the admin panel: each content type is described by a list of
// fields, from which a typed Reactive Form is built (including nested lists and repeatable groups).
import { AbstractControl, FormArray, FormControl, FormGroup, Validators, type ValidatorFn } from '@angular/forms';
import type { LookupKey } from './lookups.service';

export interface Option { value: string | number; label: string }

interface Base { key: string; label: string; hint?: string; required?: boolean; max?: number; wide?: boolean; placeholder?: string }
export type Field =
  | (Base & { type: 'text' | 'email' | 'url' | 'slug' | 'icon' | 'path'; suggestFrom?: LookupKey })
  | (Base & { type: 'textarea'; rows?: number })
  | (Base & { type: 'number'; min?: number; maxValue?: number })
  | (Base & { type: 'date' })
  /** Date and time in the admin's local time zone; sent to the API as an ISO timestamp. */
  | (Base & { type: 'datetime' })
  | (Base & { type: 'boolean' })
  | (Base & { type: 'select'; options?: Option[]; optionsFrom?: LookupKey })
  | (Base & { type: 'multiselect'; optionsFrom: LookupKey })
  | (Base & { type: 'image' })
  | (Base & { type: 'list'; itemLabel: string; multiline?: boolean })
  | (Base & { type: 'group'; fields: Field[] })
  | (Base & { type: 'objects'; itemLabel: string; fields: Field[]; summaryKey?: string });

/** Lookup lists a set of fields needs (for selects, multi-selects and suggestions). */
export function lookupsOf(fields: Field[]): LookupKey[] {
  const out = new Set<LookupKey>();
  for (const f of fields) {
    if ((f.type === 'select' || f.type === 'multiselect') && f.optionsFrom) out.add(f.optionsFrom);
    if ('suggestFrom' in f && f.suggestFrom) out.add(f.suggestFrom);
    if (f.type === 'group' || f.type === 'objects') lookupsOf(f.fields).forEach((k) => out.add(k));
  }
  return [...out];
}

function validators(f: Field): ValidatorFn[] {
  const v: ValidatorFn[] = [];
  if (f.required) v.push(f.type === 'boolean' ? Validators.requiredTrue : Validators.required);
  if (f.max) v.push(Validators.maxLength(f.max));
  if (f.type === 'email') v.push(Validators.email);
  if (f.type === 'slug') v.push(Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
  if (f.type === 'icon') v.push(Validators.pattern(/^[a-z0-9_]+$/));
  if (f.type === 'path') v.push(Validators.pattern(/^\/\S*$/));
  if (f.type === 'url') v.push(Validators.pattern(/^https?:\/\/\S+$/));
  if (f.type === 'number') {
    if (f.min !== undefined) v.push(Validators.min(f.min));
    if (f.maxValue !== undefined) v.push(Validators.max(f.maxValue));
  }
  return v;
}

/** ISO timestamp → value for <input type="datetime-local"> in local time. */
export function toLocalInput(iso: unknown): string {
  if (!iso) return '';
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Builds the control for one field, initialised with `value`. */
export function buildControl(f: Field, value: unknown): AbstractControl {
  switch (f.type) {
    case 'group': {
      const v = (value ?? {}) as Record<string, unknown>;
      return new FormGroup(Object.fromEntries(f.fields.map((sub) => [sub.key, buildControl(sub, v[sub.key])])));
    }
    case 'objects': {
      const items = Array.isArray(value) ? value : [];
      return new FormArray(items.map((item) => buildControl({ ...f, type: 'group' } as Field, item)));
    }
    case 'list': {
      const items = Array.isArray(value) ? value : [];
      return new FormArray(items.map((s) => new FormControl(String(s ?? ''), { nonNullable: true, validators: [Validators.required] })));
    }
    case 'multiselect':
      return new FormControl(Array.isArray(value) ? value : [], { nonNullable: true });
    case 'boolean':
      return new FormControl(Boolean(value), { nonNullable: true, validators: validators(f) });
    case 'number':
      return new FormControl(value === null || value === undefined || value === '' ? null : Number(value), { validators: validators(f) });
    case 'datetime':
      return new FormControl(toLocalInput(value), { nonNullable: true, validators: validators(f) });
    default:
      return new FormControl(value === null || value === undefined ? '' : String(value), { nonNullable: true, validators: validators(f) });
  }
}

export function buildForm(fields: Field[], value: Record<string, unknown> = {}): FormGroup {
  return buildControl({ key: '', label: '', type: 'group', fields }, value) as FormGroup;
}

/** A blank item for a repeatable group or list. */
export function blankItem(f: Field): AbstractControl {
  if (f.type === 'objects') return buildControl({ ...f, type: 'group' } as Field, {});
  return new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

/** Cleans the raw form value for the API: empty optional strings become null, numbers are numbers. */
export function toPayload(fields: Field[], raw: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const f of fields) {
    const v = raw[f.key];
    if (f.type === 'group') out[f.key] = toPayload(f.fields, v ?? {});
    else if (f.type === 'objects') out[f.key] = (v ?? []).map((item: Record<string, any>) => toPayload(f.fields, item));
    else if (f.type === 'list') out[f.key] = (v ?? []).map((s: string) => s.trim()).filter(Boolean);
    else if (f.type === 'number') out[f.key] = v === null || v === '' ? undefined : Number(v);
    else if (f.type === 'datetime') out[f.key] = v ? new Date(v).toISOString() : null;
    else if (typeof v === 'string') out[f.key] = v.trim() === '' && !f.required ? null : v.trim();
    else out[f.key] = v;
  }
  return out;
}

/** Applies server-side field errors ({ field: [message] }) to the matching controls. */
export function applyServerErrors(form: FormGroup, errors: Record<string, string[]>) {
  for (const [key, messages] of Object.entries(errors)) {
    const c = form.get(key);
    if (c) {
      c.setErrors({ server: messages[0] });
      c.markAsTouched();
    }
  }
}

export function errorText(c: AbstractControl | null): string | null {
  if (!c || !c.errors || !c.touched) return null;
  const e = c.errors;
  if (e['server']) return e['server'];
  if (e['required']) return 'Required.';
  if (e['maxlength']) return `Up to ${e['maxlength'].requiredLength} characters.`;
  if (e['email']) return 'Enter a valid email address.';
  if (e['min']) return `Must be at least ${e['min'].min}.`;
  if (e['max']) return `Must be at most ${e['max'].max}.`;
  if (e['pattern']) return 'This format is not valid.';
  return 'Please check this field.';
}

export const slugify = (v: string) =>
  v.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100);
