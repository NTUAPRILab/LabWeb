import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, signal, viewChild, viewChildren } from '@angular/core';
import { animate } from 'motion';
import { Icon } from '../ui/icon';
import { Reveal } from '../ui/reveal';
import { news, type NewsItem } from '../data';

const filters = ['全部', '2025', '2024', '2023', '2022', '更早'] as const;
type Filter = (typeof filters)[number];

const kinds: Record<NewsItem['kind'], { label: string; icon: string; cls: string }> = {
  award: { label: '獲獎', icon: 'award', cls: 'bg-tertiary-container text-on-tertiary-container rounded-[40%]' },
  honor: { label: '榮譽', icon: 'sparkles', cls: 'bg-primary-container text-on-primary-container rounded-full' },
  career: { label: '校友', icon: 'briefcase', cls: 'bg-secondary-container text-on-secondary-container rounded-2xl' },
  service: { label: '學術服務', icon: 'book-open', cls: 'bg-surface-high text-on-surface rounded-[30%]' },
};

@Component({
  selector: 'app-news',
  imports: [Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'news', class: 'block scroll-mt-24 px-4 py-24 md:px-8 md:py-32', '(window:resize)': 'place(false)' },
  template: `
    <div class="mx-auto max-w-4xl">
      <div appReveal>
        <span class="rounded-full bg-surface-high px-4 py-1.5 text-sm font-medium text-on-surface-variant">最新消息 · News</span>
        <h2 class="mt-6 text-5xl font-bold tracking-[-0.03em] md:text-7xl">榮譽與里程碑</h2>
      </div>

      <!-- M3 segmented button with a springy sliding indicator -->
      <div class="relative mt-10 inline-flex max-w-full flex-wrap gap-1 rounded-full bg-surface-high p-1.5" role="tablist">
        <span #indicator class="absolute top-0 left-0 rounded-full bg-primary"></span>
        @for (f of filters; track f) {
          <button
            #seg
            role="tab"
            [attr.aria-selected]="filter() === f"
            (click)="select(f)"
            class="relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors active:scale-95"
            [class]="filter() === f ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
          >
            {{ f }}
          </button>
        }
      </div>

      <ul class="mt-8 space-y-2">
        @for (it of items(); track it.key; let i = $index) {
          <li
            class="pop-in group flex gap-5 rounded-[1.75rem] bg-surface-low p-5 transition-[border-radius,background-color] duration-300 hover:rounded-[2.75rem] hover:bg-surface-mid md:p-6"
            [style.animation-delay.ms]="i * 30"
          >
            <span class="grid size-12 shrink-0 place-items-center transition-[border-radius] duration-500 group-hover:rounded-[30%] {{ kinds[it.kind].cls }}">
              <svg [appIcon]="kinds[it.kind].icon" class="size-5"></svg>
            </span>
            <div>
              <p class="text-sm font-medium text-on-surface-variant">{{ it.year }} · {{ kinds[it.kind].label }}</p>
              <p class="mt-1 leading-relaxed md:text-lg">{{ it.text }}</p>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class News {
  protected readonly filters = filters;
  protected readonly kinds = kinds;
  protected readonly filter = signal<Filter>('全部');
  protected readonly items = computed(() => {
    const f = this.filter();
    const all = news.flatMap((g) => g.items.map((it, i) => ({ ...it, year: g.year, key: `${f}-${g.year}-${i}` })));
    if (f === '全部') return all.slice(0, 8);
    if (f === '更早') return all.filter((x) => Number(x.year) < 2022);
    return all.filter((x) => x.year === f);
  });

  private readonly indicator = viewChild.required<ElementRef<HTMLElement>>('indicator');
  private readonly segs = viewChildren<ElementRef<HTMLElement>>('seg');

  constructor() {
    afterNextRender(() => this.place(false));
  }

  protected select(f: Filter) {
    this.filter.set(f);
    this.place(true);
  }

  /** Move the indicator under the selected segment. */
  protected place(spring: boolean) {
    const el = this.segs()[filters.indexOf(this.filter())]?.nativeElement;
    if (!el) return;
    const to = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth + 'px', height: el.offsetHeight + 'px' };
    animate(this.indicator().nativeElement, to, spring ? { type: 'spring', stiffness: 420, damping: 30 } : { duration: 0 });
  }
}
