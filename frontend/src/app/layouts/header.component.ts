import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import type { Site } from '../core/models';
import { IconComponent } from '../shared/icon.component';
import { mainNav } from './navigation';

@Component({
  selector: 'app-header',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    '[class.is-scrolled]': 'scrolled()',
    '(window:keydown.escape)': 'setOpen(false)',
  },
})
export class HeaderComponent {
  readonly site = input.required<Site>();
  private router = inject(Router);
  private doc = inject(DOCUMENT);

  readonly nav = computed(() => mainNav(this.site()));
  readonly menus = computed(() => this.nav().filter((m) => m.href !== '/contact'));
  readonly contact = computed(() => this.nav().find((m) => m.href === '/contact')!);
  readonly path = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.currentPath())),
    { initialValue: this.currentPath() },
  );
  readonly open = signal(false);
  readonly scrolled = signal(false);
  private openBtn = viewChild<ElementRef<HTMLButtonElement>>('openBtn');
  private closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  constructor() {
    afterNextRender(() => {
      const win = this.doc.defaultView!;
      const onScroll = () => this.scrolled.set(win.scrollY > 8);
      onScroll();
      win.addEventListener('scroll', onScroll, { passive: true });
      // Close the drawer if the viewport grows past the desktop breakpoint.
      win.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => e.matches && this.setOpen(false));
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.setOpen(false));
  }

  private currentPath() {
    return this.router.url.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  }

  isActive = (href: string) => (href === '/' ? this.path() === '/' : this.path() === href || this.path().startsWith(href + '/'));
  isCurrent = (href: string) => this.path() === href;

  setOpen(open: boolean) {
    if (open === this.open()) return;
    this.open.set(open);
    this.doc.body.style.overflow = open ? 'hidden' : '';
    queueMicrotask(() => (open ? this.closeBtn() : this.openBtn())?.nativeElement.focus());
  }

  backdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('a')) this.setOpen(false);
  }
}
