import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, viewChildren } from '@angular/core';

type Body = { x: number; y: number; rotate: number; scale: number; vx: number; vy: number; vr: number; vs: number; born: number };
const PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];
const SHADOW = '0 1px 2px rgba(0,0,0,.12), 0 10px 28px -6px rgba(0,0,0,.32)';
const SHADOW_ACTIVE = '0 2px 4px rgba(0,0,0,.14), 0 22px 44px -10px rgba(0,0,0,.42)';

/** Fanned photo stack (after React Bits "Bounce Cards"): cards pop in, and hovering one pushes the rest aside. */
@Component({
  selector: 'app-bounce-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block touch-pan-y',
    '[style.width.px]': 'containerWidth()',
    '[style.height.px]': 'containerHeight()',
  },
  template: `
    @for (src of images(); track $index) {
      <div
        #card
        class="absolute top-1/2 left-1/2 aspect-square overflow-hidden border-solid transition-shadow duration-300 will-change-transform"
        [style.width.px]="cardSize()"
        [style.border-width.px]="borderWidth()"
        [style.border-color]="borderColor()"
        [style.background]="borderColor()"
        [style.border-radius.px]="radius()"
        [style.z-index]="$index + 1"
        [style.box-shadow]="shadow"
        style="transform: translate(-50%, -50%) scale(0)"
      >
        <img class="pointer-events-none block h-full w-full object-cover select-none" [src]="src" alt="" draggable="false" />
      </div>
    }
  `,
})
export class BounceCards {
  readonly images = input<string[]>([]);
  readonly containerWidth = input(400);
  readonly containerHeight = input(400);
  readonly cardSize = input(200);
  readonly spread = input(85);
  readonly rotation = input(10);
  readonly animationDelay = input(0.5);
  readonly animationStagger = input(0.06);
  readonly bounciness = input(0.6);
  readonly pushDistance = input(160);
  readonly hoverScale = input(1.06);
  readonly borderWidth = input(5);
  readonly borderColor = input('#ffffff');
  readonly radius = input(25);

  protected readonly shadow = SHADOW;
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly slots = computed(() => {
    const n = this.images().length;
    const mid = (n - 1) / 2;
    return this.images().map((_, i) => ({ x: (i - mid) * this.spread(), y: 0, rotate: this.rotation() * PATTERN[i % PATTERN.length] }));
  });

  constructor() {
    const root = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const bodies: Body[] = [];
      const state = { hovered: -1, time: 0, layer: -1 };
      let raf = 0;
      let last = performance.now();
      let alive = true;

      const body = (i: number): Body =>
        (bodies[i] ??= { ...this.slots()[i], scale: reduce ? 1 : 0, vx: 0, vy: 0, vr: 0, vs: 0, born: state.time });

      const step = (v: number, vel: number, target: number, k: number, c: number, dt: number): [number, number] => {
        const n = vel + ((target - v) * k - vel * c) * dt;
        return [v + n * dt, n];
      };

      const frame = (now: number) => {
        raf = 0;
        if (!alive) return;
        const slots = this.slots();
        const els = this.cards();
        const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
        last = now;
        state.time += dt;
        const hovered = state.hovered;
        const popK = 170;
        const popC = 2 * (1 - 0.85 * Math.min(1, Math.max(0, this.bounciness()))) * Math.sqrt(popK);
        const moveK = 210;
        const moveC = 2 * (reduce ? 1 : 0.72) * Math.sqrt(moveK);
        const sub = Math.ceil(dt / (1 / 240));
        const h = dt / sub;
        let moving = 0;

        slots.forEach((slot, i) => {
          const el = els[i]?.nativeElement;
          if (!el) return;
          const card = body(i);
          const appeared = reduce || state.time - card.born >= this.animationDelay() + i * this.animationStagger();
          let tx = slot.x;
          let ty = slot.y;
          let tr = slot.rotate;
          let ts = appeared ? 1 : 0;
          if (hovered >= 0 && appeared) {
            if (i === hovered) {
              ty = slot.y - this.cardSize() * 0.04;
              tr = 0;
              ts = this.hoverScale();
            } else tx = slot.x + Math.sign(i - hovered) * this.pushDistance();
          }
          for (let k = 0; k < sub; k++) {
            [card.x, card.vx] = step(card.x, card.vx, tx, moveK, moveC, h);
            [card.y, card.vy] = step(card.y, card.vy, ty, moveK, moveC, h);
            [card.rotate, card.vr] = step(card.rotate, card.vr, tr, moveK, moveC, h);
            if (reduce) [card.scale, card.vs] = [ts, 0];
            else [card.scale, card.vs] = step(card.scale, card.vs, ts, popK, popC, h);
          }
          moving +=
            Math.abs(card.vx) + Math.abs(card.vy) + Math.abs(card.vr) + Math.abs(card.vs) * 100 +
            Math.abs(tx - card.x) + Math.abs(ty - card.y) + Math.abs(tr - card.rotate) + Math.abs(ts - card.scale) * 100 +
            (appeared ? 0 : 1);
          el.style.transform = `translate(-50%, -50%) translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0) rotate(${card.rotate.toFixed(3)}deg) scale(${Math.max(0, card.scale).toFixed(4)})`;
        });

        if (state.layer !== hovered) {
          state.layer = hovered;
          els.forEach((r, i) => {
            r.nativeElement.style.zIndex = String(i === hovered ? slots.length + 1 : i + 1);
            r.nativeElement.style.boxShadow = i === hovered ? SHADOW_ACTIVE : SHADOW;
          });
        }
        if (moving > 0.02) raf = requestAnimationFrame(frame);
      };

      const wake = () => {
        if (raf || !alive) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };

      const pick = (e: PointerEvent) => {
        const slots = this.slots();
        const rect = root.getBoundingClientRect();
        const px = e.clientX - rect.left - rect.width / 2;
        const py = e.clientY - rect.top - rect.height / 2;
        let best = -1;
        let dist = Infinity;
        slots.forEach((s, i) => {
          const gap = Math.abs(px - s.x);
          if (gap < dist) {
            dist = gap;
            best = i;
          }
        });
        if (best < 0) return -1;
        const half = this.cardSize() / 2;
        if (Math.abs(py - slots[best].y) > half + 12 || dist > half + 12) return -1;
        if (state.hovered >= 0 && state.hovered !== best) {
          const cur = slots[state.hovered];
          if (cur && Math.abs(px - cur.x) - dist < 6) return state.hovered;
        }
        return best;
      };
      const onMove = (e: PointerEvent) => {
        const n = pick(e);
        if (n !== state.hovered) {
          state.hovered = n;
          wake();
        }
      };
      const onLeave = () => {
        if (state.hovered !== -1) {
          state.hovered = -1;
          wake();
        }
      };
      const onDown = (e: PointerEvent) => {
        onMove(e);
        const b = bodies[state.hovered];
        if (b && !reduce) b.vs -= 2.2; // little squash on press
        wake();
      };

      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointerleave', onLeave);
      wake();
      destroyRef.onDestroy(() => {
        alive = false;
        cancelAnimationFrame(raf);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerdown', onDown);
        root.removeEventListener('pointerleave', onLeave);
      });
    });
  }
}
