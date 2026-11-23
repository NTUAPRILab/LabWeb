import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { scroll } from 'motion';
import { Icon } from '../ui/icon';
import { VideoDialog, type VideoItem } from '../ui/video-dialog';
import { links, showcase } from '../data';
import { map } from '../lib/anim';
import { I18nService } from '../lib/i18n';
import type { HeadsetScene } from '../lib/headset-scene';

/**
 * Projects as a VR headset (three.js). The section opens on a top view of the headset; scrolling
 * flies the camera behind it, down to eye level and into the light seal — like putting it on —
 * and the display comes into focus as a big screen where you pick a project left / right.
 */
@Component({
  selector: 'app-projects',
  imports: [Icon, VideoDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    id: 'projects',
    class: 'relative block h-[520vh] scroll-mt-0',
    '(pointermove)': 'onPointer($event)',
    '(document:keydown)': 'onKey($event)',
  },
  template: `
    <div #stage class="sticky top-0 h-[100svh] overflow-hidden bg-surface-low">
      <!-- intro, above the headset -->
      <div #intro class="absolute inset-x-0 top-[13svh] z-30 flex flex-col items-center px-4 text-center">
        <span class="rounded-full bg-surface-high px-4 py-1.5 text-sm font-medium text-on-surface-variant">{{ zh() ? '作品 · Projects' : 'Projects' }}</span>
        @if (zh()) {
          <h2 class="mt-5 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">做出來，<span class="text-primary">讓人摸摸看。</span></h2>
        } @else {
          <h2 class="mt-5 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">Built to be <span class="text-primary">felt by hand.</span></h2>
        }
      </div>
      <p #hint class="absolute inset-x-0 bottom-[7svh] z-30 flex items-center justify-center gap-2 text-sm font-medium text-on-surface-variant">
        {{ zh() ? '往下捲動，戴上看看' : 'Scroll to put it on' }} <svg appIcon="arrow-down" class="size-4 animate-bounce"></svg>
      </p>

      <!-- 3D headset -->
      <canvas #gl class="absolute inset-0 z-20 h-full w-full" aria-hidden="true"></canvas>
      <div #dark class="pointer-events-none absolute inset-0 z-20 bg-[#0d120f]" style="opacity: 0"></div>

      <!-- the view inside the headset: fades in once the camera is "wearing" it -->
      <div #screen class="absolute inset-0 z-10 overflow-hidden bg-[#0d120f] text-white" style="pointer-events: none; opacity: 0">
        <div #view class="absolute inset-0 will-change-transform">
          @for (it of [current()]; track it.id) {
            <img [src]="it.src" alt="" class="fade-in absolute inset-0 h-full w-full scale-125 object-cover opacity-45 blur-3xl" />
          }
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]"></div>

          <!-- HUD -->
          <div class="absolute inset-x-0 top-[84px] flex items-center justify-between px-5 font-mono text-xs tracking-[0.2em] text-white/70 uppercase md:top-[96px] md:px-12 md:text-sm">
            <span>APRILab · Projects</span>
            <div class="flex items-center gap-4">
              <span>{{ pad(index() + 1) }} / {{ pad(items.length) }}</span>
              <a [href]="links.youtube" target="_blank" rel="noreferrer" class="hidden items-center gap-1 rounded-full border border-white/25 px-3 py-1.5 tracking-normal normal-case transition hover:bg-white/10 md:inline-flex">
                YouTube <svg appIcon="arrow-up-right" class="size-4"></svg>
              </a>
            </div>
          </div>

          <!-- coverflow -->
          <div
            class="absolute inset-0 touch-pan-y select-none [perspective:1600px]"
            (pointerdown)="dragStart($event)"
            (pointerup)="dragEnd($event)"
            (wheel)="onWheel($event)"
          >
            @for (it of items; track it.id; let i = $index) {
              <button
                class="group absolute top-[47%] left-1/2 aspect-video w-[min(80vw,1000px)] overflow-hidden rounded-[1.75rem] bg-black text-left shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] transition-[transform,opacity,filter,border-radius] duration-700 ease-[cubic-bezier(0.34,1.2,0.64,1)] md:w-[min(58vw,1000px)] md:rounded-[2.5rem]"
                [style.transform]="transformOf(i)"
                [style.opacity]="opacityOf(i)"
                [style.z-index]="100 - abs(i - index())"
                [style.filter]="i === index() ? 'none' : 'brightness(0.5) saturate(0.7)'"
                [attr.tabindex]="interactive() && abs(i - index()) <= 1 ? 0 : -1"
                [attr.aria-label]="(zh() ? it.title : it.en) + (i === index() ? (zh() ? '，播放影片' : ', play video') : '')"
                (click)="pick(i)"
              >
                <img [src]="it.src" alt="" draggable="false" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 transition-opacity duration-500 md:p-9" [style.opacity]="i === index() ? 1 : 0">
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-white/75 md:text-sm">{{ it.category }}</p>
                    <p class="mt-1 text-xl leading-tight font-bold [text-wrap:balance] md:text-4xl">{{ zh() ? it.title : it.en }}</p>
                    <p class="mt-1 hidden text-white/70 md:block">{{ zh() ? it.en : it.title }}</p>
                  </div>
                  <span class="grid size-12 shrink-0 place-items-center rounded-full bg-white text-on-surface transition group-hover:scale-110 group-active:scale-95 md:size-16">
                    <svg appIcon="play" class="size-5 fill-current md:size-6"></svg>
                  </span>
                </div>
              </button>
            }
          </div>

          <!-- controls -->
          <div class="absolute inset-x-0 bottom-[6svh] flex flex-col items-center gap-3">
            <div class="flex items-center gap-3">
              <button class="grid size-12 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 active:scale-90 disabled:opacity-30" (click)="go(index() - 1)" [disabled]="index() === 0" [attr.aria-label]="zh() ? '上一個' : 'Previous'">
                <svg appIcon="arrow-left" class="size-5"></svg>
              </button>
              <div class="flex items-center gap-1.5">
                @for (it of items; track it.id; let i = $index) {
                  <button class="h-2 rounded-full transition-all duration-500" [class]="i === index() ? 'w-7 bg-white' : 'w-2 bg-white/35 hover:bg-white/60'" (click)="go(i)" [attr.aria-label]="zh() ? it.title : it.en"></button>
                }
              </div>
              <button class="grid size-12 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 active:scale-90 disabled:opacity-30" (click)="go(index() + 1)" [disabled]="index() === items.length - 1" [attr.aria-label]="zh() ? '下一個' : 'Next'">
                <svg appIcon="arrow-right" class="size-5"></svg>
              </button>
            </div>
            <p class="hidden text-xs text-white/50 md:block">{{ zh() ? '← → 方向鍵、拖曳或點兩側卡片切換' : 'Use ← →, drag, or click a side card' }}</p>
          </div>
        </div>
      </div>

    </div>

    @if (playing(); as it) {
      <app-video-dialog [item]="it" (closed)="playing.set(null)" animate.leave="fade-out" />
    }
  `,
})
export class Projects {
  protected readonly i18n = inject(I18nService);
  protected readonly zh = computed(() => this.i18n.lang() === 'zh');
  protected readonly links = links;
  protected readonly items: VideoItem[] = showcase;
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.items[this.index()]);
  protected readonly interactive = signal(false);
  protected readonly playing = signal<VideoItem | null>(null);
  protected readonly abs = Math.abs;

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly intro = viewChild.required<ElementRef<HTMLElement>>('intro');
  private readonly hint = viewChild.required<ElementRef<HTMLElement>>('hint');
  private readonly screen = viewChild.required<ElementRef<HTMLElement>>('screen');
  private readonly view = viewChild.required<ElementRef<HTMLElement>>('view');
  private readonly gl = viewChild.required<ElementRef<HTMLCanvasElement>>('gl');
  private readonly dark = viewChild.required<ElementRef<HTMLElement>>('dark');
  private scene: HeadsetScene | null = null;
  private dragX: number | null = null;
  private dragged = false;
  private lastWheel = 0;

  protected pad = (n: number) => String(n).padStart(2, '0');

  protected transformOf(i: number) {
    const off = i - this.index();
    const a = Math.min(Math.abs(off), 3);
    return `translate(-50%, -50%) translateX(${off * 74}%) translateZ(${-a * 240}px) rotateY(${-Math.sign(off) * Math.min(a, 1.5) * 22}deg) scale(${1 - Math.min(a, 2) * 0.06})`;
  }

  protected opacityOf(i: number) {
    const a = Math.abs(i - this.index());
    return a <= 1 ? 1 : a === 2 ? 0.45 : 0;
  }

  protected go(i: number) {
    this.index.set(Math.max(0, Math.min(this.items.length - 1, i)));
  }

  protected pick(i: number) {
    if (this.dragged) return;
    if (i === this.index()) this.playing.set(this.items[i]);
    else this.go(i);
  }

  protected onKey(e: KeyboardEvent) {
    if (!this.interactive() || this.playing()) return;
    if (e.key === 'ArrowRight') this.go(this.index() + 1);
    else if (e.key === 'ArrowLeft') this.go(this.index() - 1);
    else return;
    e.preventDefault();
  }

  protected onPointer(e: PointerEvent) {
    this.scene?.setPointer(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
  }

  protected onWheel(e: WheelEvent) {
    // horizontal wheel / trackpad swipe flips projects; vertical keeps scrolling the page
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    const now = performance.now();
    if (now - this.lastWheel < 450) return;
    this.lastWheel = now;
    this.go(this.index() + Math.sign(e.deltaX));
  }

  protected dragStart(e: PointerEvent) {
    this.dragX = e.clientX;
    this.dragged = false;
  }

  protected dragEnd(e: PointerEvent) {
    if (this.dragX === null) return;
    const dx = e.clientX - this.dragX;
    this.dragX = null;
    if (Math.abs(dx) > 50) {
      this.dragged = true;
      this.go(this.index() - Math.sign(dx));
      setTimeout(() => (this.dragged = false));
    }
  }

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const stage = this.stage().nativeElement;
      const intro = this.intro().nativeElement.style;
      const hint = this.hint().nativeElement.style;
      const screen = this.screen().nativeElement.style;
      const view = this.view().nativeElement.style;
      const dark = this.dark().nativeElement.style;
      const canvas = this.gl().nativeElement;
      let progress = 0;
      let near = false;

      const draw = () => {
        const p = progress;
        // overview text leaves as the camera starts moving
        intro.opacity = hint.opacity = String(map(p, [0.02, 0.1], [1, 0]));
        intro.transform = `translateY(${map(p, [0, 0.12], [0, -60])}px)`;
        // inside the light seal it goes dark, then the display lights up and focuses
        dark.opacity = String(Math.min(map(p, [0.4, 0.47], [0, 1]), map(p, [0.48, 0.55], [1, 0])));
        screen.opacity = String(map(p, [0.46, 0.52], [0, 1]));
        const blur = map(p, [0.46, 0.58], [14, 0]);
        view.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
        view.transform = `scale(${map(p, [0.46, 0.6], [1.25, 1])})`;
        const showGl = p < 0.5;
        canvas.style.visibility = showGl ? 'visible' : 'hidden';
        this.scene?.setProgress(p);
        this.scene?.setActive(near && showGl);

        const live = p >= 0.55;
        screen.pointerEvents = live ? 'auto' : 'none';
        if (live !== this.interactive()) this.interactive.set(live);
      };

      const stop = scroll(
        (p: number) => {
          progress = p;
          draw();
        },
        { target: host, offset: ['start start', 'end end'] },
      );

      // load three.js + the model only when the section gets close
      let disposed = false;
      const io = new IntersectionObserver(
        ([e]) => {
          near = e.isIntersecting;
          if (near && !this.scene) {
            const debug = new URLSearchParams(location.search).has('model-debug');
            import('../lib/headset-scene')
              .then((m) => m.createHeadsetScene(canvas, 'models/headset.glb', debug))
              .then((sc) => {
                if (disposed) return sc.dispose();
                this.scene = sc;
                draw();
              })
              .catch((err) => console.error('headset scene failed', err));
          }
          draw();
        },
        { rootMargin: '800px 0px' },
      );
      io.observe(host);
      const ro = new ResizeObserver(() => {
        this.scene?.resize();
        draw();
      });
      ro.observe(stage);
      destroyRef.onDestroy(() => {
        disposed = true;
        stop();
        io.disconnect();
        ro.disconnect();
        this.scene?.dispose();
      });
    });
  }
}
