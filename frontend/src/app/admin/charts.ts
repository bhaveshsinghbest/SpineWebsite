// Small dependency-free charts for the dashboard (inline SVG). Each chart has a text alternative.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarDatum { label: string; value: number; title?: string }

/** Vertical bar chart with a light grid, value labels on hover and a screen-reader table. */
@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="m-0">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" class="chart" role="img" [attr.aria-label]="ariaLabel()" preserveAspectRatio="none">
        @for (t of ticks(); track t.v) {
          <line [attr.x1]="padL" [attr.x2]="W" [attr.y1]="t.y" [attr.y2]="t.y" class="grid" />
          <text [attr.x]="padL - 6" [attr.y]="t.y + 4" class="tick" text-anchor="end">{{ t.v }}</text>
        }
        @for (b of bars(); track b.label) {
          <g class="bar-g">
            <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="3" [attr.fill]="color()"><title>{{ b.title }}</title></rect>
            @if (b.value > 0) { <text [attr.x]="b.x + b.w / 2" [attr.y]="b.y - 5" class="val" text-anchor="middle">{{ b.value }}</text> }
            <text [attr.x]="b.x + b.w / 2" [attr.y]="H - 6" class="tick" text-anchor="middle">{{ b.label }}</text>
          </g>
        }
      </svg>
      <table class="visually-hidden">
        <caption>{{ ariaLabel() }}</caption>
        <tbody>@for (d of data(); track d.label) { <tr><th scope="row">{{ d.title ?? d.label }}</th><td>{{ d.value }}</td></tr> }</tbody>
      </table>
    </figure>
  `,
  styles: `
    .chart { width: 100%; height: 220px; display: block; overflow: visible; }
    .grid { stroke: #e6e9f0; stroke-width: 1; }
    .tick { font-size: 11px; fill: #6b7385; }
    .val { font-size: 11px; fill: #1d2a44; font-weight: 600; opacity: 0; transition: opacity 120ms; }
    .bar-g:hover .val { opacity: 1; }
    .bar-g rect { transition: opacity 120ms; }
    .bar-g:hover rect { opacity: 0.8; }
  `,
})
export class BarChartComponent {
  readonly data = input.required<BarDatum[]>();
  readonly color = input('#1b3a6b');
  readonly ariaLabel = input('Chart');
  readonly W = 640;
  readonly H = 220;
  readonly padL = 34;
  private readonly padT = 18;
  private readonly padB = 24;
  private readonly max = computed(() => {
    const m = Math.max(0, ...this.data().map((d) => d.value));
    if (m <= 4) return 4;
    const step = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / step) * step;
  });
  readonly ticks = computed(() => {
    const max = this.max();
    const inner = this.H - this.padT - this.padB;
    return [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: Math.round(max * f), y: this.padT + inner * (1 - f) }));
  });
  readonly bars = computed(() => {
    const d = this.data();
    const inner = this.H - this.padT - this.padB;
    const slot = (this.W - this.padL) / Math.max(1, d.length);
    const w = Math.max(6, slot * 0.6);
    return d.map((x, i) => {
      const h = this.max() ? (x.value / this.max()) * inner : 0;
      return { ...x, title: `${x.title ?? x.label}: ${x.value}`, x: this.padL + i * slot + (slot - w) / 2, w, h, y: this.padT + inner - h };
    });
  });
}
