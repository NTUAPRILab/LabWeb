import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { scroll } from 'motion';
import { Icon } from '../ui/icon';
import { featured } from '../data';
import { map } from '../lib/anim';

/** Pixel-page style reveal: a small rounded card grows to fill the screen as you scroll. */
@Component({
  selector: 'app-showcase',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'showcase', class: 'relative block h-[220vh]' },
  template: `
    <div class="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
      <div #card class="relative min-w-[280px] overflow-hidden bg-on-surface" style="width: 46%; height: 52%; border-radius: 200px">
        <img #img [src]="featured.thumbnail" [alt]="featured.title" class="absolute inset-0 h-full w-full object-cover" style="transform: scale(1.35)" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
        <div #caption class="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 text-white opacity-0 md:flex-row md:items-end md:justify-between md:p-14">
          <div>
            <span class="rounded-full bg-white/20 px-4 py-1.5 text-sm backdrop-blur">Featured · Mixed Reality</span>
            <h2 class="mt-5 text-4xl leading-tight font-bold tracking-tight md:text-7xl">從實驗桌，<br />到真實的手感。</h2>
            <p class="mt-4 max-w-xl text-white/80 md:text-lg">{{ featured.zh }}：用混合實境還原焊接現場，學員在安全的環境裡反覆練習。</p>
          </div>
          <a [href]="'https://www.youtube.com/watch?v=' + featured.id" target="_blank" rel="noreferrer" class="btn w-fit bg-white text-on-surface hover:bg-primary-container">
            <svg appIcon="play" class="size-5 fill-current"></svg> 觀看影片
          </a>
        </div>
      </div>
    </div>
  `,
})
export class Showcase {
  protected readonly featured = featured;
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly img = viewChild.required<ElementRef<HTMLElement>>('img');
  private readonly caption = viewChild.required<ElementRef<HTMLElement>>('caption');

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const card = this.card().nativeElement.style;
      const img = this.img().nativeElement.style;
      const caption = this.caption().nativeElement.style;
      const stop = scroll(
        (p: number) => {
          card.width = map(p, [0, 0.65], [46, 100]) + '%';
          card.height = map(p, [0, 0.65], [52, 100]) + '%';
          card.borderRadius = map(p, [0, 0.65], [200, 0]) + 'px';
          img.transform = `scale(${map(p, [0, 0.65], [1.35, 1])})`;
          caption.opacity = String(map(p, [0.55, 0.8], [0, 1]));
          caption.transform = `translateY(${map(p, [0.55, 0.8], [40, 0])}px)`;
        },
        { target: host, offset: ['start end', 'end end'] },
      );
      destroyRef.onDestroy(stop);
    });
  }
}
