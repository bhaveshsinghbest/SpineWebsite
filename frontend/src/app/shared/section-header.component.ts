import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mw-3xl stack-3" [class.mx-auto]="center()" [class.text-center]="center()">
      <p class="eyebrow text-cobalt">{{ eyebrow() }}</p>
      <h2 class="section-title" [attr.id]="headingId() || null">{{ title() }}</h2>
      @if (lead()) { <p class="fs-lead text-muted">{{ lead() }}</p> }
    </div>
  `,
  styles: `:host { display: block; }`,
})
export class SectionHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input<string | undefined>();
  readonly center = input(false);
  readonly headingId = input<string | undefined>();
}
