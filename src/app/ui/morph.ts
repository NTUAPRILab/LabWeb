import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, viewChild } from '@angular/core';
import { N, radii, toPath, type ShapeName } from '../lib/shapes';
import { scrollVelocity } from '../lib/anim';

let uid = 0;

/**
 * A shape that morphs between Material-3-Expressive-style polar shapes,
 * slowly spins, spins faster while the page scrolls, and morphs on hover.
 * Usage: <svg appMorph [shapes]="['cookie','flower']" class="w-40"></svg>
 */
@Component({
  selector: 'svg[appMorph]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    viewBox: '0 0 1 1',
    '[attr.role]': 'image() ? "img" : null',
    '[attr.aria-hidden]': 'image() ? null : "true"',
    '(pointerenter)': 'hoverMorph() && next()',
  },
  template: `
    @if (image()) {
      <svg:defs>
        <svg:clipPath [attr.id]="id" clipPathUnits="userSpaceOnUse"><svg:path #path /></svg:clipPath>
      </svg:defs>
      <svg:image [attr.href]="image()" width="1" height="1" preserveAspectRatio="xMidYMid slice" [attr.clip-path]="'url(#' + id + ')'" />
    } @else {
      <svg:path #path [attr.fill]="color()" />
    }
  `,
})
export class Morph {
  readonly shapes = input.required<ShapeName[]>();
  readonly image = input<string>();
  readonly color = input('#c1ecd5');
  /** degrees per second */
  readonly spin = input(6);
  /** auto-advance to the next shape every n ms (0 = only on hover) */
  readonly every = input(0);
  /** how strongly page-scroll speed spins the shape */
  readonly scrollSpin = input(1);
  readonly hoverMorph = input(true);

  protected readonly id = 'morph' + uid++;
  private readonly path = viewChild.required<ElementRef<SVGPathElement>>('path');
  private idx = 0;
  private cur!: Float32Array;
  private tgt!: Float32Array;

  next() {
    const s = this.shapes();
    this.idx = (this.idx + 1) % s.length;
    this.tgt = radii(s[this.idx]);
  }

  constructor() {
    const host = inject(ElementRef<SVGSVGElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      scrollVelocity.start();
      this.cur = radii(this.shapes()[0]);
      this.tgt = radii(this.shapes()[0]);
      let visible = true;
      let rot = 0;
      let last = performance.now();
      let raf = 0;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible) return;
        rot += ((this.spin() * Math.PI) / 180) * dt + scrollVelocity.value * 0.00004 * this.scrollSpin();
        const k = 1 - Math.pow(0.0008, dt); // frame-rate independent ease
        for (let i = 0; i < N; i++) this.cur[i] += (this.tgt[i] - this.cur[i]) * k;
        this.path().nativeElement.setAttribute('d', toPath(this.cur, rot));
      };
      raf = requestAnimationFrame(loop);
      const timer = this.every() ? setInterval(() => this.next(), this.every()) : 0;

      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        io.disconnect();
        if (timer) clearInterval(timer);
      });
    });
  }
}
