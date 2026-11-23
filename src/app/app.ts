import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, effect, signal, viewChild, viewChildren } from '@angular/core';
import { animate } from 'motion';
import { Icon } from './ui/icon';
import { Hero } from './sections/hero';
import { Showcase } from './sections/showcase';
import { Research } from './sections/research';
import { Projects } from './sections/projects';
import { News } from './sections/news';
import { Footer } from './sections/footer';
import { links, navItems } from './data';

/** Transparent bar at the top; once you scroll it springs into a floating, blurred pill. */
@Component({
  selector: 'app-top-bar',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3', '(window:scroll)': 'onScroll()' },
  template: `
    <div #bar class="flex w-full max-w-[1360px] items-center justify-between gap-4 rounded-3xl px-3 py-2">
      <a href="#top" aria-label="APRILab 首頁" class="shrink-0 pl-2">
        <span class="block h-9 w-32 bg-no-repeat" style="background-image: url(aprilab-logo.png); background-size: 100% auto; background-position: 0 45.4%"></span>
      </a>
      <nav class="relative hidden items-center md:flex" (mouseleave)="leave()">
        <span #pill class="pointer-events-none absolute top-0 left-0 rounded-full bg-primary-container opacity-0"></span>
        @for (n of navItems; track n.name; let i = $index) {
          <a
            #navLink
            [href]="n.link"
            (mouseenter)="hover(i)"
            class="relative rounded-full px-4 py-2 text-[15px] font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >{{ n.name }}</a>
        }
      </nav>
      <a [href]="links.server" target="_blank" rel="noreferrer" class="btn hidden !h-11 bg-primary !px-5 text-sm text-on-primary md:inline-flex">Lab Server</a>
      <button class="grid size-11 place-items-center rounded-full bg-surface-high md:hidden" (click)="open.set(!open())" aria-label="選單" [attr.aria-expanded]="open()">
        <svg [appIcon]="open() ? 'x' : 'menu'" class="size-5"></svg>
      </button>
    </div>
    @if (open()) {
      <nav class="menu-in absolute inset-x-3 top-20 flex flex-col gap-1 rounded-[2rem] bg-surface-high p-3 shadow-xl md:hidden" animate.leave="fade-out">
        @for (n of navItems; track n.name) {
          <a [href]="n.link" (click)="open.set(false)" class="rounded-full px-5 py-3 text-lg active:bg-primary-container">{{ n.name }}</a>
        }
      </nav>
    }
  `,
})
export class TopBar {
  protected readonly navItems = navItems;
  protected readonly links = links;
  protected readonly scrolled = signal(false);
  protected readonly open = signal(false);
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly pill = viewChild.required<ElementRef<HTMLElement>>('pill');
  private readonly navLinks = viewChildren<ElementRef<HTMLElement>>('navLink');
  private pillShown = false;

  protected onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }

  constructor() {
    afterNextRender(() => this.scrolled.set(window.scrollY > 40));
    effect(() => {
      const s = this.scrolled();
      const bar = this.bar().nativeElement;
      bar.style.backdropFilter = s ? 'blur(16px)' : 'none';
      animate(
        bar,
        { backgroundColor: s ? 'rgba(228,234,227,0.85)' : 'rgba(228,234,227,0)', borderRadius: s ? '999px' : '24px', maxWidth: s ? '980px' : '1360px' },
        { type: 'spring', stiffness: 220, damping: 26 },
      );
    });
  }

  /** The highlight pill slides from item to item with a spring. */
  protected hover(i: number) {
    const el = this.navLinks()[i].nativeElement;
    const pill = this.pill().nativeElement;
    const to = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth + 'px', height: el.offsetHeight + 'px' };
    if (!this.pillShown) {
      animate(pill, to, { duration: 0 });
      animate(pill, { opacity: [0, 1], scale: [0.85, 1] }, { type: 'spring', stiffness: 400, damping: 30 });
      this.pillShown = true;
    } else animate(pill, to, { type: 'spring', stiffness: 400, damping: 30 });
  }

  protected leave() {
    this.pillShown = false;
    animate(this.pill().nativeElement, { opacity: 0, scale: 0.9 }, { duration: 0.15 });
  }
}

@Component({
  selector: 'app-root',
  imports: [TopBar, Hero, Showcase, Research, Projects, News, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-top-bar />
    <main>
      <app-hero />
      <app-showcase />
      <app-research />
      <app-projects />
      <app-news />
    </main>
    <app-footer />
  `,
})
export class App {}
