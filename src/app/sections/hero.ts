import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild, viewChildren } from '@angular/core';
import { scroll } from 'motion';
import { Icon } from '../ui/icon';
import { Morph } from '../ui/morph';
import { Reveal } from '../ui/reveal';
import { RotatingText } from '../ui/rotating-text';
import { heroShapes } from '../data';
import { Spring, map, reducedMotion } from '../lib/anim';
import type { ShapeName } from '../lib/shapes';

type Floater = { shapes: ShapeName[]; image?: string; color?: string; cls: string; depth: number; delay: number; spin: number };

const floaters: Floater[] = [
  { shapes: ['cookie', 'flower', 'circle'], image: heroShapes.a, cls: 'left-[3%] top-[16%] w-[19vw] max-w-[280px] min-w-[120px]', depth: 40, delay: 0.15, spin: 8 },
  { shapes: ['clover', 'squircle', 'cookie'], image: heroShapes.b, cls: 'right-[4%] top-[12%] w-[22vw] max-w-[320px] min-w-[130px]', depth: 60, delay: 0.25, spin: -6 },
  { shapes: ['squircle', 'gem', 'clover'], image: heroShapes.d, cls: 'left-[9%] bottom-[8%] w-[15vw] max-w-[220px] min-w-[100px]', depth: 28, delay: 0.35, spin: 10 },
  { shapes: ['flower', 'sunny', 'squircle'], image: heroShapes.e, cls: 'right-[10%] bottom-[6%] w-[17vw] max-w-[250px] min-w-[110px]', depth: 50, delay: 0.45, spin: -9 },
  { shapes: ['sunny', 'cookie'], color: '#ffdea6', cls: 'left-[24%] top-[8%] w-[6vw] min-w-[44px]', depth: 80, delay: 0.55, spin: 25 },
  { shapes: ['gem', 'clover'], color: '#c1ecd5', cls: 'right-[30%] bottom-[14%] w-[5vw] min-w-[40px]', depth: 90, delay: 0.6, spin: -30 },
  { shapes: ['clover', 'flower'], color: '#3f6b55', cls: 'right-[27%] top-[20%] w-[3vw] min-w-[28px]', depth: 110, delay: 0.7, spin: 40 },
];

@Component({
  selector: 'app-hero',
  imports: [Icon, Morph, Reveal, RotatingText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    id: 'top',
    class: 'relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pt-24',
    '(pointermove)': 'onPointer($event)',
  },
  template: `
    <!-- floating shapes: pop in, follow the mouse at different depths, spread out as you scroll away -->
    <div #layer class="pointer-events-none absolute inset-0">
      @for (f of floaters; track $index) {
        <div #floater class="pointer-events-auto absolute {{ f.cls }}">
          <div [appReveal]="{ scale: 0, rotate: -40 }" on="load" [delay]="f.delay" [stiffness]="180" [damping]="12">
            <svg
              appMorph
              [shapes]="f.shapes"
              [image]="f.image"
              [color]="f.color ?? '#c1ecd5'"
              [spin]="f.spin"
              [every]="f.image ? 3800 + f.delay * 2000 : 2400"
              class="block h-auto w-full drop-shadow-[0_18px_30px_rgba(23,29,25,0.14)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.08]"
            ></svg>
          </div>
        </div>
      }
    </div>

    <div #text class="relative z-10 flex max-w-5xl flex-col items-center text-center">
      <span
        [appReveal]="{ opacity: 0, y: 20, scale: 0.9 }"
        on="load"
        [delay]="0.1"
        [stiffness]="260"
        class="mb-8 inline-flex items-center gap-2 rounded-full bg-surface-high px-4 py-2 text-sm font-medium text-on-surface-variant"
      >
        <span class="size-2 rounded-full bg-primary"></span>
        NTU APRILab · 先進產品實現與互動實驗室
      </span>

      <h1 class="text-[17vw] leading-[0.95] font-bold tracking-[-0.04em] md:text-[8.5rem]" style="font-variation-settings: 'ROND' 100, 'opsz' 144">
        @for (line of lines; track line; let i = $index) {
          <span class="block overflow-hidden pb-2">
            <span class="block" [class.text-primary]="i === 1" [appReveal]="{ y: '110%', rotate: 4 }" on="load" [delay]="0.25 + i * 0.12" [damping]="16">
              {{ line }}
            </span>
          </span>
        }
      </h1>

      <div
        [appReveal]="{ opacity: 0, y: 20 }"
        on="load"
        [delay]="0.6"
        [stiffness]="260"
        class="mt-8 flex flex-wrap items-center justify-center gap-3 text-xl text-on-surface-variant md:text-2xl"
      >
        我們正在做
        <app-rotating-text [texts]="words" />
      </div>

      <div [appReveal]="{ opacity: 0, y: 20 }" on="load" [delay]="0.75" [stiffness]="260" class="mt-10 flex flex-wrap justify-center gap-3">
        <a href="#showcase" class="btn bg-primary text-on-primary hover:bg-[#335a47]">
          <svg appIcon="play" class="size-5 fill-current"></svg> 看作品
        </a>
        <a href="#research" class="btn bg-secondary-container text-on-secondary-container hover:bg-primary-container">
          研究領域 <svg appIcon="arrow-down" class="size-5"></svg>
        </a>
      </div>
    </div>
  `,
})
export class Hero {
  protected readonly floaters = floaters;
  protected readonly lines = ['讓虛擬，', '摸得到。'];
  protected readonly words = ['力回饋手套', 'MR 焊接訓練', '遠端觸覺重現', 'VR 插管訓練', 'AR 遙控機器人'];

  private readonly layer = viewChild.required<ElementRef<HTMLElement>>('layer');
  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text');
  private readonly floaterEls = viewChildren<ElementRef<HTMLElement>>('floater');
  private readonly springs = floaters.map(() => ({ x: new Spring(), y: new Spring() }));
  private mouse = { x: 0, y: 0 };
  private wake = () => {};

  protected onPointer(e: PointerEvent) {
    this.mouse = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 };
    this.wake();
  }

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // scroll: shapes spread outward and fade, headline drifts down
      const layer = this.layer().nativeElement;
      const text = this.text().nativeElement;
      const stopScroll = scroll(
        (p: number) => {
          const fade = map(p, [0, 0.75], [1, 0]);
          layer.style.transform = `scale(${map(p, [0, 1], [1, 1.35])})`;
          layer.style.opacity = String(fade);
          text.style.transform = `translateY(${map(p, [0, 1], [0, 120])}px)`;
          text.style.opacity = String(fade);
        },
        { target: host, offset: ['start start', 'end start'] },
      );

      // mouse: each shape follows the pointer with its own depth, on a soft spring
      if (reducedMotion()) {
        destroyRef.onDestroy(stopScroll);
        return;
      }
      let raf = 0;
      let last = 0;
      const frame = (now: number) => {
        const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
        last = now;
        let moving = false;
        this.floaterEls().forEach((r, i) => {
          const s = this.springs[i];
          s.x.target = this.mouse.x * floaters[i].depth;
          s.y.target = this.mouse.y * floaters[i].depth;
          r.nativeElement.style.transform = `translate3d(${s.x.step(dt).toFixed(2)}px, ${s.y.step(dt).toFixed(2)}px, 0)`;
          moving ||= !s.x.settled || !s.y.settled;
        });
        raf = moving ? requestAnimationFrame(frame) : 0;
      };
      this.wake = () => {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      destroyRef.onDestroy(() => {
        stopScroll();
        cancelAnimationFrame(raf);
      });
    });
  }
}
