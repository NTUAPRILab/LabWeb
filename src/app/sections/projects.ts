import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../ui/icon';
import { Reveal } from '../ui/reveal';
import { CardsCarousel } from '../ui/cards-carousel';
import { links, showcase } from '../data';

@Component({
  selector: 'app-projects',
  imports: [Icon, Reveal, CardsCarousel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'projects', class: 'block scroll-mt-24 bg-surface-low py-24 md:py-32' },
  template: `
    <div class="mx-auto flex max-w-[1360px] flex-col gap-6 px-4 md:flex-row md:items-end md:justify-between md:px-8">
      <div appReveal>
        <span class="rounded-full bg-surface-high px-4 py-1.5 text-sm font-medium text-on-surface-variant">作品 · Projects</span>
        <h2 class="mt-6 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">做出來，<br /><span class="text-primary">讓人摸摸看。</span></h2>
      </div>
      <a [href]="links.youtube" target="_blank" rel="noreferrer" class="btn w-fit bg-surface-high text-on-surface hover:bg-primary-container">
        YouTube 頻道 <svg appIcon="arrow-up-right" class="size-5"></svg>
      </a>
    </div>
    <app-cards-carousel [items]="showcase" />
  `,
})
export class Projects {
  protected readonly links = links;
  protected readonly showcase = showcase;
}
