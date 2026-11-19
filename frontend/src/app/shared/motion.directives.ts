import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

const reducedMotion = (doc: Document) => doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;

function reveal(doc: Document, elements: HTMLElement[], stagger: boolean) {
  const win = doc.defaultView;
  if (!win || reducedMotion(doc) || !('IntersectionObserver' in win)) return;
  const vh = win.innerHeight;
  const pending = elements.filter((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) return false; // already on screen: show at once, no flash
    el.setAttribute('data-reveal', '');
    if (stagger) el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 70}ms`);
    return true;
  });
  if (!pending.length) return;
  doc.documentElement.classList.add('reveal-ready');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      el.classList.add('is-visible');
      // Hand transitions back to the element (hover effects) once revealed.
      win.setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('is-visible'); el.style.removeProperty('--reveal-delay'); }, 1100);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  pending.forEach((el) => io.observe(el));
}

/** Fades the element up as it scrolls into view. */
@Directive({ selector: '[reveal]' })
export class RevealDirective {
  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement;
    const doc = inject(DOCUMENT);
    afterNextRender(() => reveal(doc, [el], false));
  }
}

/** Reveals the element's children with a short stagger. */
@Directive({ selector: '[revealGroup]' })
export class RevealGroupDirective {
  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement;
    const doc = inject(DOCUMENT);
    afterNextRender(() => reveal(doc, Array.from(el.children) as HTMLElement[], true));
  }
}

/** Counts small headline figures up from zero when they come into view (e.g. "36" services). */
@Directive({ selector: '[countUp]' })
export class CountUpDirective {
  readonly countUp = input.required<string>();
  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement;
    const doc = inject(DOCUMENT);
    afterNextRender(() => {
      const win = doc.defaultView;
      const target = Number(this.countUp());
      if (!win || reducedMotion(doc) || !Number.isFinite(target) || target < 2 || target > 999 || !('IntersectionObserver' in win)) return;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = win.performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / 900);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) win.requestAnimationFrame(tick);
        };
        win.requestAnimationFrame(tick);
      });
      io.observe(el);
    });
  }
}

export const MOTION = [RevealDirective, RevealGroupDirective, CountUpDirective] as const;
