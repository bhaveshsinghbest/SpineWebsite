import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminApi } from './admin-api.service';
import { apiErrorMessage } from '../core/interceptors';
import { blankItem, errorText, type Field, type Option } from './form-engine';
import { LookupService } from './lookups.service';
import { ConfirmService } from './ui';

/** Renders one field of the form engine (recursively for groups, lists and repeatable groups). */
@Component({
  selector: 'app-field',
  imports: [ReactiveFormsModule, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let f = field();
    @switch (f.type) {
      @case ('group') {
        <fieldset class="border rounded p-3 mb-3">
          <legend class="float-none w-auto px-2 fs-6 fw-semibold mb-0">{{ f.label }}</legend>
          <div class="row g-3">
            @for (sub of f.fields; track sub.key) {
              <div [class]="colClass(sub)"><app-field [field]="sub" [control]="child(sub.key)" [idPrefix]="id() + '-'" /></div>
            }
          </div>
        </fieldset>
      }
      @case ('objects') {
        <div class="mb-1 d-flex align-items-center justify-content-between">
          <span class="form-label mb-0 fw-semibold">{{ f.label }}</span>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addItem()">+ Add {{ f.itemLabel }}</button>
        </div>
        @if (f.hint) { <div class="form-text mt-0 mb-2">{{ f.hint }}</div> }
        @for (item of arr().controls; track $index; let i = $index; let first = $first; let last = $last) {
          <details class="border rounded mb-2 bg-white" [open]="openIndex() === i">
            <summary class="d-flex align-items-center gap-2 px-3 py-2">
              <span class="text-muted small">{{ i + 1 }}.</span>
              <span class="flex-grow-1 text-truncate">{{ summary(item) || 'New ' + f.itemLabel }}</span>
              <span class="btn-group btn-group-sm" (click)="$event.preventDefault()">
                <button type="button" class="btn btn-light border" [disabled]="first" (click)="move(i, -1)" aria-label="Move up">↑</button>
                <button type="button" class="btn btn-light border" [disabled]="last" (click)="move(i, 1)" aria-label="Move down">↓</button>
                <button type="button" class="btn btn-light border text-danger" (click)="removeItem(i)" aria-label="Remove">✕</button>
              </span>
            </summary>
            <div class="px-3 pb-3 pt-1 row g-3">
              @for (sub of f.fields; track sub.key) {
                <div [class]="colClass(sub)"><app-field [field]="sub" [control]="$any(item).get(sub.key)" [idPrefix]="id() + '-' + i + '-'" /></div>
              }
            </div>
          </details>
        } @empty { <p class="text-muted small border rounded p-3 bg-white">None yet.</p> }
      }
      @case ('list') {
        <div class="mb-1 d-flex align-items-center justify-content-between">
          <span class="form-label mb-0 fw-semibold">{{ f.label }}</span>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addItem()">+ Add {{ f.itemLabel }}</button>
        </div>
        @if (f.hint) { <div class="form-text mt-0 mb-2">{{ f.hint }}</div> }
        @for (item of arr().controls; track $index; let i = $index; let first = $first; let last = $last) {
          <div class="d-flex gap-2 mb-2 align-items-start">
            @if (f.multiline) { <textarea class="form-control" rows="3" [formControl]="$any(item)" [attr.aria-label]="f.itemLabel + ' ' + (i + 1)"></textarea> }
            @else { <input class="form-control" [formControl]="$any(item)" [attr.aria-label]="f.itemLabel + ' ' + (i + 1)" /> }
            <div class="btn-group btn-group-sm flex-shrink-0">
              <button type="button" class="btn btn-light border" [disabled]="first" (click)="move(i, -1)" aria-label="Move up">↑</button>
              <button type="button" class="btn btn-light border" [disabled]="last" (click)="move(i, 1)" aria-label="Move down">↓</button>
              <button type="button" class="btn btn-light border text-danger" (click)="removeItem(i)" aria-label="Remove">✕</button>
            </div>
          </div>
        } @empty { <p class="text-muted small border rounded p-2 bg-white mb-0">None yet.</p> }
      }
      @case ('boolean') {
        <div class="form-check form-switch mt-4">
          <input class="form-check-input" type="checkbox" role="switch" [id]="id()" [formControl]="ctrl()" />
          <label class="form-check-label" [for]="id()">{{ f.label }}</label>
        </div>
        @if (f.hint) { <div class="form-text">{{ f.hint }}</div> }
      }
      @default {
        <label class="form-label" [for]="id()">{{ f.label }}@if (f.required) { <span class="text-danger"> *</span> }</label>
        @switch (f.type) {
          @case ('textarea') { <textarea class="form-control" [id]="id()" [rows]="$any(f).rows ?? 3" [formControl]="ctrl()" [class.is-invalid]="err()" [attr.placeholder]="f.placeholder ?? null"></textarea> }
          @case ('select') {
            <select class="form-select" [id]="id()" [formControl]="ctrl()" [class.is-invalid]="err()">
              @if (!f.required) { <option value="">—</option> }
              @for (o of selectOptions(); track o.value) { <option [value]="o.value">{{ o.label }}</option> }
            </select>
          }
          @case ('multiselect') {
            <div class="border rounded p-2 bg-white d-flex flex-wrap gap-3">
              @for (o of lookup(); track o.value) {
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" [id]="id() + '-' + o.value" [checked]="isChecked(o.value)" (change)="toggle(o.value)" />
                  <label class="form-check-label" [for]="id() + '-' + o.value">{{ o.label }}</label>
                </div>
              }
            </div>
            @if (!lookup().length) { <div class="form-text">Nothing to choose from yet.</div> }
          }
          @case ('number') { <input type="number" class="form-control" [id]="id()" [formControl]="ctrl()" [class.is-invalid]="err()" /> }
          @case ('date') { <input type="date" class="form-control" [id]="id()" [formControl]="ctrl()" [class.is-invalid]="err()" /> }
          @case ('datetime') { <input type="datetime-local" class="form-control" [id]="id()" [formControl]="ctrl()" [class.is-invalid]="err()" /> }
          @case ('image') {
            <div class="d-flex gap-2 align-items-start">
              @if (ctrl().value) { <img [src]="ctrl().value" alt="" class="rounded border bg-white" style="width:64px;height:64px;object-fit:cover" /> }
              <div class="flex-grow-1">
                <input class="form-control mb-2" [id]="id()" [formControl]="ctrl()" placeholder="/uploads/… or https://…" [class.is-invalid]="err()" />
                <label class="btn btn-sm btn-outline-secondary mb-0">
                  @if (uploading()) { Uploading… } @else { {{ ctrl().value ? 'Replace image' : 'Upload image' }} }
                  <input type="file" accept="image/jpeg,image/png,image/webp" class="d-none" (change)="upload($any($event.target).files?.[0])" />
                </label>
                @if (ctrl().value) { <button type="button" class="btn btn-sm btn-link text-danger ms-1" (click)="clearImage()">Remove</button> }
                <div class="form-text">JPG, PNG or WebP, up to 8 MB. Images are resized and converted to WebP.</div>
                @if (uploadError()) { <div class="text-danger small mt-1">{{ uploadError() }}</div> }
              </div>
            </div>
          }
          @case ('icon') {
            <div class="input-group">
              <span class="input-group-text"><span class="icon" style="font-size:20px">{{ ctrl().value }}</span></span>
              <input class="form-control" [id]="id()" [formControl]="ctrl()" [class.is-invalid]="err()" />
            </div>
          }
          @default {
            <input class="form-control" [type]="f.type === 'email' ? 'email' : 'text'" [id]="id()" [formControl]="ctrl()" [class.is-invalid]="err()" [attr.placeholder]="f.placeholder ?? null" [attr.list]="lookup().length ? id() + '-list' : null" />
            @if (lookup().length) { <datalist [id]="id() + '-list'">@for (o of lookup(); track o.value) { <option [value]="o.value"></option> }</datalist> }
          }
        }
        @if (err()) { <div class="invalid-feedback d-block">{{ err() }}</div> }
        @else if (f.hint) { <div class="form-text">{{ f.hint }}</div> }
      }
    }
  `,
})
export class FieldComponent {
  readonly field = input.required<Field>();
  readonly control = input.required<AbstractControl | null>();
  readonly idPrefix = input('f-');
  private api = inject(AdminApi);
  private lookups = inject(LookupService);
  private confirm = inject(ConfirmService);
  /** Options for selects / multi-selects / suggestions that come from the database. */
  readonly lookup = computed<Option[]>(() => {
    const f = this.field();
    const key = (f.type === 'select' || f.type === 'multiselect') ? f.optionsFrom : 'suggestFrom' in f ? f.suggestFrom : undefined;
    return key ? this.lookups.options()[key] ?? [] : [];
  });
  readonly selectOptions = computed<Option[]>(() => { const f = this.field(); return f.type === 'select' && f.options ? f.options : this.lookup(); });

  readonly id = computed(() => this.idPrefix() + this.field().key);
  readonly openIndex = signal<number | null>(null);
  readonly uploading = signal(false);
  readonly uploadError = signal('');

  ctrl = () => this.control() as FormControl;
  arr = () => this.control() as FormArray;
  child = (key: string) => (this.control() as FormGroup).get(key);
  err = () => errorText(this.control());
  colClass = (f: Field) => (f.wide || ['textarea', 'list', 'objects', 'group', 'multiselect', 'image'].includes(f.type) ? 'col-12' : 'col-md-6');

  summary(item: AbstractControl): string {
    const f = this.field();
    if (f.type !== 'objects') return '';
    const key = f.summaryKey ?? f.fields[0]?.key;
    return String((item as FormGroup).get(key)?.value ?? '');
  }

  addItem() {
    this.arr().push(blankItem(this.field()));
    this.openIndex.set(this.arr().length - 1);
    this.arr().markAsDirty();
  }
  async removeItem(i: number) {
    if (this.field().type === 'objects' && !(await this.confirm.ask({ title: 'Remove item', message: `Remove this ${this.field().label.toLowerCase()} item? The change is saved when you save the form.`, confirmLabel: 'Remove', danger: true }))) return;
    this.arr().removeAt(i);
    this.arr().markAsDirty();
  }
  move(i: number, delta: number) {
    const a = this.arr();
    const c = a.at(i);
    a.removeAt(i);
    a.insert(i + delta, c);
    a.markAsDirty();
  }

  isChecked = (v: string | number) => (this.ctrl().value as (string | number)[]).includes(v);
  toggle(v: string | number) {
    const cur = this.ctrl().value as (string | number)[];
    this.ctrl().setValue(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
    this.ctrl().markAsDirty();
  }

  clearImage() { this.ctrl().setValue(''); this.ctrl().markAsDirty(); }

  upload(file: File | undefined) {
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set('');
    this.api.upload(file, 'image').subscribe({
      next: (r) => { this.ctrl().setValue(r.url); this.ctrl().markAsDirty(); this.uploading.set(false); },
      error: (e) => { this.uploadError.set(apiErrorMessage(e, 'Upload failed.')); this.uploading.set(false); },
    });
  }
}
