import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Material Symbols ligature, rendered on the host <span> (no wrapper element). */
@Component({
  selector: 'span[icon]',
  template: '{{ icon() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true', '[style.font-size.px]': 'size()' },
})
export class IconComponent {
  readonly icon = input.required<string>();
  readonly size = input(20);
}
