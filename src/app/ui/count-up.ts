import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { animate, inView } from 'motion';

/** Counts from 0 to `to` the first time it scrolls into view. */
@Component({
  selector: 'app-count-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tabular-nums' },
  template: `0`,
})
export class CountUp {
  readonly to = input.required<number>();
  readonly duration = input(2);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const stop = inView(el, () => {
        const a = animate(0, this.to(), {
          duration: this.duration(),
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString()),
        });
        destroyRef.onDestroy(() => a.stop());
      });
      destroyRef.onDestroy(stop);
    });
  }
}
