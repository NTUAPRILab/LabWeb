import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { scroll } from 'motion';
import { Icon } from '../ui/icon';
import { VideoDialog, type VideoItem } from '../ui/video-dialog';
import { links, showcase } from '../data';
import { map } from '../lib/anim';
import { I18nService } from '../lib/i18n';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Rounded rectangle path, centred on (cx, cy). */
function rr(cx: number, cy: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  return `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
}

/** Headset shell seen from the wearer's side: a rounded body with a nose notch at the bottom. */
function shell(cx: number, cy: number, w: number, h: number, r: number, nw: number, nd: number) {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  const n = nw / 2;
  return (
    `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}` +
    `H${cx + n}C${cx + n * 0.55} ${y1} ${cx + n * 0.5} ${y1 - nd} ${cx} ${y1 - nd}C${cx - n * 0.5} ${y1 - nd} ${cx - n * 0.55} ${y1} ${cx - n} ${y1}` +
    `H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`
  );
}

/**
 * Projects as a VR headset. Scrolling down zooms into the headset: the two lenses merge,
 * the frame slides past the screen edges and the blurry view comes into focus — like putting
 * it on. Inside is a big screen where you pick a project left / right and play it.
 */
@Component({
  selector: 'app-projects',
  imports: [Icon, VideoDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    id: 'projects',
    class: 'relative block h-[420vh] scroll-mt-0',
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

      <!-- the view inside the headset: clipped to the lenses until it fills the screen -->
      <div #screen class="absolute inset-0 z-10 overflow-hidden bg-[#0d120f] text-white" style="pointer-events: none">
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

      <!-- headset frame drawn over the view -->
      <svg class="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <mask id="vr-lens-mask" maskUnits="userSpaceOnUse" x="-50000" y="-50000" width="100000" height="100000">
            <path #maskShell fill="white" />
            <path #maskLens fill="black" />
          </mask>
          <linearGradient id="vr-shell-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#34403a" />
            <stop offset="1" stop-color="#151a17" />
          </linearGradient>
        </defs>
        <path #strap fill="#3f6b55" />
        <path #shell fill="url(#vr-shell-fill)" mask="url(#vr-lens-mask)" />
        <path #rim fill="none" stroke="rgba(193,236,213,0.35)" stroke-width="2" />
      </svg>
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
  private readonly maskShell = viewChild.required<ElementRef<SVGPathElement>>('maskShell');
  private readonly maskLens = viewChild.required<ElementRef<SVGPathElement>>('maskLens');
  private readonly shellPath = viewChild.required<ElementRef<SVGPathElement>>('shell');
  private readonly strap = viewChild.required<ElementRef<SVGPathElement>>('strap');
  private readonly rim = viewChild.required<ElementRef<SVGPathElement>>('rim');
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
      const maskShell = this.maskShell().nativeElement;
      const maskLens = this.maskLens().nativeElement;
      const shellEl = this.shellPath().nativeElement;
      const strap = this.strap().nativeElement;
      const rim = this.rim().nativeElement;
      let progress = 0;

      const draw = () => {
        const p = progress;
        const W = stage.clientWidth;
        const H = stage.clientHeight;
        const B = W < 768 ? W * 0.84 : Math.min(W * 0.5, 620); // headset width at rest

        const zoom = ease(map(p, [0.05, 0.5], [0, 1]));
        const merge = ease(map(p, [0.1, 0.42], [0, 1]));

        // lens geometry in headset units (1 = headset width)
        const lw = lerp(0.385, 0.88, merge);
        const lh = lerp(0.34, 0.42, merge);
        const lx = lerp(0.215, 0, merge);
        const lr = lerp(0.15, 0.1, merge);
        // scale so the merged lens ends up larger than the viewport
        const sEnd = Math.max(W / (0.88 * B), H / (0.42 * B)) * 1.12;
        const s = Math.exp(Math.log(sEnd) * zoom);
        const u = B * s;
        const cx = W / 2;
        const cy = lerp(H * 0.62, H * 0.5, zoom);

        const lens = rr(cx - lx * u, cy, lw * u, lh * u, lr * u) + rr(cx + lx * u, cy, lw * u, lh * u, lr * u);
        const body = shell(cx, cy, u, 0.52 * u, 0.2 * u, 0.17 * u, lerp(0.085, 0, merge) * u);
        maskShell.setAttribute('d', body);
        maskLens.setAttribute('d', lens);
        shellEl.setAttribute('d', body);
        rim.setAttribute('d', lens);
        rim.style.opacity = String(1 - merge);
        // strap: one band on each side, tucked under the shell's edge
        strap.setAttribute('d', rr(cx - 0.6 * u, cy - 0.02 * u, 0.24 * u, 0.13 * u, 0.065 * u) + rr(cx + 0.6 * u, cy - 0.02 * u, 0.24 * u, 0.13 * u, 0.065 * u));
        strap.style.opacity = String(map(p, [0.04, 0.16], [1, 0]));

        const done = zoom >= 1;
        screen.clipPath = done ? 'none' : `path("${lens}")`;
        const blur = map(p, [0.12, 0.47], [12, 0]);
        view.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
        view.transform = `scale(${map(p, [0.05, 0.5], [1.35, 1])})`;

        intro.opacity = hint.opacity = String(map(p, [0.02, 0.12], [1, 0]));
        intro.transform = `translateY(${map(p, [0, 0.15], [0, -60])}px)`;

        const live = p >= 0.5;
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
      const ro = new ResizeObserver(draw);
      ro.observe(stage);
      destroyRef.onDestroy(() => {
        stop();
        ro.disconnect();
      });
    });
  }
}
