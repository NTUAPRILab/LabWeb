import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, afterNextRender, inject, input, signal, viewChild } from '@angular/core';
import type { DotWaveConfig } from '../footer-wave.config';

type Key = Exclude<keyof DotWaveConfig, 'color'>;
const sliders: { key: Key; label: string; min: number; max: number; step: number }[] = [
  { key: 'speed', label: '速度 speed', min: 0, max: 3, step: 0.05 },
  { key: 'frequency', label: '頻率 frequency', min: 0.2, max: 4, step: 0.05 },
  { key: 'amplitude', label: '高度 amplitude', min: 0, max: 3, step: 0.05 },
  { key: 'density', label: '密度 density', min: 0.3, max: 2.5, step: 0.05 },
  { key: 'dotSize', label: '點大小 dot size', min: 0.4, max: 4, step: 0.1 },
  { key: 'opacity', label: '透明度 opacity', min: 0, max: 1, step: 0.01 },
  { key: 'height', label: '高度 px', min: 120, max: 600, step: 10 },
  { key: 'pointer', label: '滑鼠影響 pointer', min: 0, max: 3, step: 0.05 },
];

/**
 * A field of dots rolling like a wave, seen in perspective (Canvas 2D).
 * All look parameters come from DotWaveConfig; add ?wave to the URL for a live tuning panel.
 */
@Component({
  selector: 'app-dot-wave',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block',
    '[style.height.px]': 'cfg().height',
    '(pointermove)': 'onPointer($event)',
    '(pointerleave)': 'pointerOn = false',
  },
  template: `
    <canvas #canvas class="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_88%,transparent)]" aria-hidden="true"></canvas>
    @if (tuning) {
      <div class="fixed right-4 bottom-4 z-[80] w-72 rounded-3xl bg-white/95 p-4 text-sm text-on-surface shadow-2xl backdrop-blur">
        <p class="mb-3 font-bold">Dot wave 調整</p>
        @for (s of sliders; track s.key) {
          <label class="mb-2 block">
            <span class="flex justify-between"><span>{{ s.label }}</span><span class="font-mono">{{ cfg()[s.key] }}</span></span>
            <input type="range" class="w-full accent-[#3f6b55]" [min]="s.min" [max]="s.max" [step]="s.step" [value]="cfg()[s.key]" (input)="set(s.key, $event)" />
          </label>
        }
        <label class="mb-3 flex items-center justify-between">
          <span>顏色 color</span>
          <input type="color" [value]="cfg().color" (input)="setColor($event)" />
        </label>
        <button class="w-full rounded-full bg-primary py-2 font-medium text-on-primary active:scale-95" (click)="copy()">{{ copied() ? '已複製 ✓' : '複製設定' }}</button>
      </div>
    }
  `,
})
export class DotWave implements OnInit {
  readonly config = input.required<DotWaveConfig>();

  protected readonly cfg = signal<DotWaveConfig>({} as DotWaveConfig);
  protected readonly copied = signal(false);
  protected readonly sliders = sliders;
  protected readonly tuning = typeof location !== 'undefined' && new URLSearchParams(location.search).has('wave');
  protected pointerOn = false;
  private pointer = { x: 0, y: 0 };
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  ngOnInit() {
    this.cfg.set({ ...this.config() });
  }

  protected set(key: Key, e: Event) {
    this.cfg.update((c) => ({ ...c, [key]: Number((e.target as HTMLInputElement).value) }));
  }
  protected setColor(e: Event) {
    this.cfg.update((c) => ({ ...c, color: (e.target as HTMLInputElement).value }));
  }
  protected copy() {
    const c = this.cfg();
    const text = `export const footerWave: DotWaveConfig = ${JSON.stringify(c, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")};`;
    navigator.clipboard?.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  protected onPointer(e: PointerEvent) {
    const r = this.canvas().nativeElement.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    this.pointerOn = true;
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d')!;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let W = 0, H = 0, dpr = 1;
      let visible = true;
      let raf = 0;
      let t = 0;
      let last = performance.now();
      let bump = 0; // eased pointer influence

      const resize = () => {
        dpr = Math.min(2, devicePixelRatio || 1);
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      };

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible || !W) return;
        const c = this.cfg();
        t += dt * (reduce ? 0 : c.speed);
        bump += ((this.pointerOn ? 1 : 0) - bump) * Math.min(1, dt * 4);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.color;

        const cols = Math.round(110 * c.density);
        const rows = Math.round(34 * c.density);
        const zNear = 0.9, zFar = 5;
        const F = W * 0.5; // focal length
        const horizon = H * 0.08;
        const camH = ((H * 0.92) * zNear) / F; // near row lands at the bottom edge
        const spanX = 3.2;
        const f = c.frequency;
        const amp = camH * 0.32 * c.amplitude;
        const px = this.pointer.x, py = this.pointer.y;

        for (let r = 0; r < rows; r++) {
          const k = r / (rows - 1); // 0 far → 1 near
          const z = zFar + (zNear - zFar) * k;
          const persp = F / z;
          const fade = (0.2 + 0.8 * Math.pow(k, 0.9)) * c.opacity;
          if (fade < 0.01) continue;
          const size = Math.max(0.5, (c.dotSize * persp) / (F / zNear));
          for (let q = 0; q < cols; q++) {
            const x = (q / (cols - 1) - 0.5) * 2 * spanX;
            let h =
              Math.sin(x * 1.3 * f + t * 1.1) * Math.cos(z * 0.9 * f - t * 0.7) +
              0.55 * Math.sin((x * 0.7 + z * 1.6) * f - t * 1.6) +
              0.25 * Math.sin(x * 3.1 * f + z * 2.3 * f + t * 2.2);
            let sx = W / 2 + x * persp;
            if (sx < -4 || sx > W + 4) continue;
            let sy = horizon + (camH - h * amp) * persp;
            if (bump > 0.01 && c.pointer > 0) {
              const dx = sx - px, dy = sy - py;
              const g = Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70));
              sy -= g * 26 * c.pointer * bump;
            }
            ctx.globalAlpha = fade;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, 6.2832);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(canvas);
      raf = requestAnimationFrame(frame);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
      });
    });
  }
}
