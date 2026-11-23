import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, effect, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { animate, inView, stagger } from 'motion';
import { Icon } from './icon';

export type CarouselItem = { id: string; title: string; category: string; en: string; src: string };

/**
 * Horizontal card rail with a sheet that opens on click (after Aceternity "Apple Cards Carousel").
 * Cards round their corners on hover; the sheet plays the YouTube video.
 */
@Component({
  selector: 'app-cards-carousel',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block w-full', '(document:keydown.escape)': 'close()' },
  template: `
    <div #rail class="flex w-full overflow-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20" (scroll)="check()">
      <div class="mx-auto flex max-w-7xl flex-row justify-start gap-4 pl-4">
        @for (item of items(); track item.id; let i = $index) {
          <button
            class="card group relative z-10 flex h-80 w-56 shrink-0 flex-col items-start justify-start overflow-hidden rounded-[2rem] bg-surface-high text-left transition-[border-radius] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] last:mr-[5%] hover:rounded-[4rem] md:h-[34rem] md:w-96 md:last:mr-[33%]"
            (click)="open(i)"
          >
            <div class="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/55 via-transparent to-transparent"></div>
            <div class="relative z-30 p-8">
              <p class="text-sm font-medium text-white md:text-base">{{ item.category }}</p>
              <p class="mt-2 max-w-xs text-xl font-semibold [text-wrap:balance] text-white md:text-3xl">{{ item.title }}</p>
            </div>
            <img
              [src]="item.src"
              [alt]="item.title"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>
        }
      </div>
    </div>
    <div class="mr-10 flex justify-end gap-2">
      <button class="grid size-12 place-items-center rounded-full bg-surface-high transition hover:bg-primary-container active:scale-90 disabled:opacity-40" (click)="by(-1)" [disabled]="!canLeft()" aria-label="上一個">
        <svg appIcon="arrow-left" class="size-6 text-on-primary-container"></svg>
      </button>
      <button class="grid size-12 place-items-center rounded-full bg-surface-high transition hover:bg-primary-container active:scale-90 disabled:opacity-40" (click)="by(1)" [disabled]="!canRight()" aria-label="下一個">
        <svg appIcon="arrow-right" class="size-6 text-on-primary-container"></svg>
      </button>
    </div>

    @if (active(); as item) {
      <div class="fixed inset-0 z-50 overflow-auto" role="dialog" aria-modal="true" [attr.aria-label]="item.title" animate.leave="fade-out">
        <div class="fade-in fixed inset-0 bg-[#191c1a]/60 backdrop-blur-lg" (click)="close()"></div>
        <div class="sheet-in relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-[2.5rem] bg-surface p-5 md:p-10" animate.leave="sheet-out">
          <button class="sticky top-4 ml-auto flex size-10 items-center justify-center rounded-full bg-primary transition active:scale-90" (click)="close()" aria-label="關閉">
            <svg appIcon="x" class="size-6 text-white"></svg>
          </button>
          <p class="text-base font-medium text-primary">{{ item.category }}</p>
          <p class="mt-4 text-2xl font-semibold text-on-surface md:text-5xl">{{ item.title }}</p>
          <div class="py-10">
            <p class="mb-6 text-lg text-on-surface-variant">{{ item.en }}</p>
            <div class="aspect-video w-full overflow-hidden rounded-[2rem] bg-on-surface">
              <iframe class="h-full w-full" [src]="embed()" [title]="item.en" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CardsCarousel {
  readonly items = input.required<CarouselItem[]>();

  protected readonly active = signal<CarouselItem | null>(null);
  protected readonly embed = signal<SafeResourceUrl | null>(null);
  protected readonly canLeft = signal(false);
  protected readonly canRight = signal(true);
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    const destroyRef = inject(DestroyRef);
    effect(() => {
      document.body.style.overflow = this.active() ? 'hidden' : '';
    });
    afterNextRender(() => {
      this.check();
      const rail = this.rail().nativeElement;
      const cards = rail.querySelectorAll<HTMLElement>('.card');
      cards.forEach((c) => (c.style.opacity = '0'));
      const stop = inView(rail, () => {
        animate(cards, { opacity: [0, 1], y: [40, 0] }, { type: 'spring', stiffness: 140, damping: 18, delay: stagger(0.08) });
      });
      destroyRef.onDestroy(stop);
    });
  }

  protected check() {
    const r = this.rail().nativeElement;
    this.canLeft.set(r.scrollLeft > 0);
    this.canRight.set(r.scrollLeft < r.scrollWidth - r.clientWidth - 1);
  }

  protected by(dir: number) {
    this.rail().nativeElement.scrollBy({ left: dir * (window.innerWidth < 768 ? 240 : 400), behavior: 'smooth' });
  }

  protected open(i: number) {
    const item = this.items()[i];
    this.embed.set(this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${item.id}?rel=0`));
    this.active.set(item);
  }

  protected close() {
    this.active.set(null);
  }
}
