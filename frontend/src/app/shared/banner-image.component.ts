import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, booleanAttribute, inject, input } from '@angular/core';
import { bannerSrc, bannerSrcset } from '../core/banners';

/**
 * Responsive banner photograph on the host <img> (WebP, srcset). With `priority`, the image is
 * fetched first and preloaded from the server-rendered <head> (largest contentful paint).
 */
@Component({
  selector: 'img[banner]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    alt: '',
    width: '1408',
    height: '768',
    decoding: 'async',
    '[attr.src]': 'src()',
    '[attr.srcset]': 'srcset()',
    '[attr.sizes]': 'sizes()',
    '[attr.loading]': 'priority() ? "eager" : "lazy"',
    '[attr.fetchpriority]': 'priority() ? "high" : null',
  },
})
export class BannerImageComponent implements OnInit {
  readonly banner = input.required<string>();
  readonly sizes = input('100vw');
  readonly widths = input<readonly number[]>([480, 720, 1024, 1408]);
  readonly priority = input(false, { transform: booleanAttribute });
  private doc = inject(DOCUMENT);

  src = () => bannerSrc(this.banner(), 1024);
  srcset = () => bannerSrcset(this.banner(), this.widths());

  ngOnInit() {
    if (!this.priority()) return;
    const id = `preload-${this.banner()}`;
    if (this.doc.getElementById(id)) return;
    const link = this.doc.createElement('link');
    link.id = id;
    link.rel = 'preload';
    link.as = 'image';
    link.href = this.src();
    link.setAttribute('imagesrcset', this.srcset());
    link.setAttribute('imagesizes', this.sizes());
    link.setAttribute('fetchpriority', 'high');
    this.doc.head.appendChild(link);
  }
}
