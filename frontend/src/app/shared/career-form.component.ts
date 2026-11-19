import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { apiErrorMessage, apiFieldErrors } from '../core/interceptors';
import { IconComponent } from './icon.component';

export const GENERAL_APPLICATION = 'General application — future opportunities';
const MAX_MB = 5;
const SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  pdf: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46, // %PDF
  docx: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04, // ZIP container
  doc: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0, // OLE2
};

/**
 * Job application with CV upload. The browser checks the CV's type, size and file signature for quick
 * feedback; the server repeats every check, stores the CV privately and notifies the recruitment team.
 */
@Component({
  selector: 'app-career-form',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './career-form.component.html',
  styles: `
    :host { display: block; }
    .drop { border: 2px dashed var(--c-line-strong); background: var(--c-mist); transition: border-color 150ms ease, background-color 150ms ease; }
    .drop:hover, .drop.over { border-color: var(--c-cobalt); background: #fff; }
    .drop.invalid { border-color: #ef4444; }
    .consent { width: 1rem; height: 1rem; accent-color: var(--c-navy); margin-top: 0.25rem; flex-shrink: 0; }
    .spinner-sm { width: 1rem; height: 1rem; }
    @media (min-width: 640px) { .w-sm-auto { width: auto !important; } }
  `,
})
export class CareerFormComponent {
  readonly positions = input.required<string[]>();
  readonly email = input.required<string>();
  readonly general = GENERAL_APPLICATION;
  readonly maxMb = MAX_MB;
  private api = inject(ApiService);
  private fb = inject(NonNullableFormBuilder);
  private started = Date.now();
  private fileInput = viewChild<ElementRef<HTMLInputElement>>('cvInput');

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{8,20}$/)]],
    location: ['', [Validators.required, Validators.maxLength(80)]],
    position: [GENERAL_APPLICATION, Validators.required],
    qualification: ['', [Validators.required, Validators.maxLength(120)]],
    experience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
    linkedin: ['', [Validators.maxLength(200), Validators.pattern(/^https:\/\/.+/)]],
    message: ['', Validators.maxLength(1500)],
    consent: [false, Validators.requiredTrue],
    company_website: [''],
  });
  readonly file = signal<File | null>(null);
  readonly fileError = signal('');
  readonly dragOver = signal(false);
  readonly sending = signal(false);
  readonly status = signal<{ ok: boolean; text: string } | null>(null);
  private serverErrors = signal<Record<string, string[]>>({});

  /** Pre-selects a position (used by the "Apply for this role" buttons). */
  choose(position: string) {
    this.form.controls.position.setValue(position);
  }

  err(name: keyof typeof this.form.controls): string | null {
    const server = this.serverErrors()[name]?.[0];
    if (server) return server;
    const c = this.form.controls[name];
    if (!c.touched || c.valid) return null;
    if (c.hasError('required')) return name === 'consent' ? 'Please give your consent to continue.' : 'This field is required.';
    if (c.hasError('email')) return 'Enter a valid email address.';
    if (c.hasError('pattern')) return name === 'linkedin' ? 'Use the full https:// address of your profile.' : 'Enter a valid phone number.';
    if (c.hasError('min') || c.hasError('max')) return 'Enter a number between 0 and 50.';
    return 'Please check this field.';
  }

  async pick(files: FileList | null | undefined) {
    const f = files?.[0] ?? null;
    this.file.set(f);
    await this.checkFile();
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    void this.pick(e.dataTransfer?.files);
  }

  private async checkFile(): Promise<boolean> {
    const f = this.file();
    if (!f) return this.setFileError('Please attach your CV.');
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!(ext in SIGNATURES)) return this.setFileError('Please upload a PDF, DOC or DOCX file.');
    if (f.size === 0) return this.setFileError('The selected file is empty.');
    if (f.size > MAX_MB * 1024 * 1024) return this.setFileError(`The file is larger than ${MAX_MB} MB. Please upload a smaller file.`);
    const head = new Uint8Array(await f.slice(0, 4).arrayBuffer());
    if (!SIGNATURES[ext](head)) return this.setFileError('This file does not look like a genuine PDF or Word document. Please upload your CV again.');
    this.fileError.set('');
    return true;
  }

  private setFileError(msg: string) {
    this.fileError.set(msg);
    return false;
  }

  fileLabel() {
    const f = this.file();
    return f ? `${f.name} · ${(f.size / 1024 / 1024).toFixed(2)} MB` : 'Choose a file or drag it here';
  }

  async submit() {
    this.serverErrors.set({});
    const fileOk = await this.checkFile();
    if (this.form.invalid || !fileOk) {
      this.form.markAllAsTouched();
      this.status.set({ ok: false, text: 'Please correct the highlighted fields and try again.' });
      return;
    }
    const v = this.form.getRawValue();
    const data = new FormData();
    for (const [k, val] of Object.entries(v)) {
      if (k === 'consent') data.append('consent', val ? 'true' : '');
      else data.append(k, String(val).trim());
    }
    data.append('form_started', String(this.started));
    data.append('cv', this.file()!);
    this.sending.set(true);
    this.status.set(null);
    this.api.submitApplication(data).subscribe({
      next: () => {
        this.sending.set(false);
        this.form.reset();
        this.file.set(null);
        const input = this.fileInput()?.nativeElement;
        if (input) input.value = '';
        this.started = Date.now();
        this.status.set({ ok: true, text: 'Thank you. Your application has been received. If your profile matches a current or upcoming role, our team will contact you.' });
      },
      error: (e) => {
        this.sending.set(false);
        const fields = apiFieldErrors(e);
        this.serverErrors.set(fields);
        if (fields['cv']) this.fileError.set(fields['cv'][0]);
        this.status.set({ ok: false, text: `${apiErrorMessage(e, 'Sorry, your application could not be submitted.')} You can also email your CV to ${this.email()}.` });
      },
    });
  }
}
