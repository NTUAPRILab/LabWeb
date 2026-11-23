import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';
import { inView } from 'motion';

/**
 * A hand of photo cards fanned along the bottom edge of its container. About half of every card
 * hangs below the edge (the parent clips it); the card under the pointer rises fully into view and
 * its neighbours lean away.
 */
@Component({
  selector: 'app-photo-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '(pointermove)': 'onMove($event)',
    '(pointerleave)': 'hovered.set(-1)',
    '(window:resize)': 'measure()',
  },
  template: `
    @for (src of images(); track src; let i = $index) {
      <a
        [href]="href()"
        target="_blank"
        rel="noreferrer"
        class="absolute bottom-0 left-1/2 block aspect-[4/3] overflow-hidden rounded-[1.25rem] border-[5px] border-[#f6fbf4] bg-[#f6fbf4] shadow-[0_18px_40px_-12px_rgba(0,33,20,0.45)] transition-[transform,box-shadow] duration-[650ms] ease-[cubic-bezier(0.34,1.45,0.64,1)] md:rounded-[1.75rem] md:border-[6px]"
        [style.width.px]="cardW()"
        [style.transform]="transformOf(i)"
        [style.z-index]="hovered() === i ? 50 : i + 1"
        [style.transition-delay]="shown() ? '0ms' : i * 60 + 'ms'"
        [attr.aria-label]="label()"
        (focus)="hovered.set(i)"
        (blur)="hovered.set(-1)"
      >
        <img [src]="src" alt="" loading="lazy" draggable="false" class="h-full w-full object-cover" />
      </a>
    }
  `,
})
export class PhotoHand {
  readonly images = input.required<string[]>();
  readonly href = input('#');
  readonly label = input('');

  protected readonly hovered = signal(-1);
  protected readonly shown = signal(false);
  protected readonly cardW = signal(260);
  private readonly spacing = signal(62);
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  protected measure() {
    const w = this.el.clientWidth;
    const n = Math.max(1, this.images().length);
    const card = w < 640 ? 170 : Math.round(Math.min(320, w * 0.25));
    this.cardW.set(card);
    // spread the hand over most of the available width
    this.spacing.set(Math.min(card * 0.6, (w - card * 0.9) / Math.max(1, n - 1)));
  }

  protected transformOf(i: number) {
    const n = this.images().length;
    const off = i - (n - 1) / 2;
    const h = this.cardW() * 0.75;
    const hov = this.hovered();
    let x = off * this.spacing();
    let y = h * 0.45 + off * off * 4; // about half of each card hangs below the edge; outer cards sit lower
    let rot = off * 5;
    let scale = 1;
    if (hov === i) {
      y = -h * 0.14;
      rot = 0;
      scale = 1.12;
    } else if (hov >= 0) {
      const d = i - hov;
      x += (Math.sign(d) * this.cardW() * 0.28) / Math.abs(d);
      y += 10;
    }
    if (!this.shown()) y += h * 1.2; // dealt in from below on first view
    return `translate(-50%, 0) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${scale})`;
  }

  /** Pick the card whose fan slot is nearest the pointer, so overlapping cards don't flicker. */
  protected onMove(e: PointerEvent) {
    const r = this.el.getBoundingClientRect();
    const px = e.clientX - r.left - r.width / 2;
    const n = this.images().length;
    let best = -1;
    let dist = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(px - (i - (n - 1) / 2) * this.spacing());
      if (d < dist) [dist, best] = [d, i];
    }
    if (dist > this.cardW() * 0.6) best = -1;
    if (best !== this.hovered()) this.hovered.set(best);
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.measure();
      const stop = inView(this.el, () => {
        this.shown.set(true);
      }, { amount: 0.15 });
      destroyRef.onDestroy(stop);
    });
  }
}
