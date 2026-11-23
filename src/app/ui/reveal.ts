import { Directive, DestroyRef, ElementRef, OnInit, afterNextRender, inject, input } from '@angular/core';
import { animate, inView } from 'motion';
import { reducedMotion } from '../lib/anim';

type From = Partial<Record<'opacity' | 'x' | 'y' | 'scale' | 'rotate', number | string>>;
const DEFAULT: From = { opacity: 0, y: 30 };
const REST = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 } as const;

/**
 * Spring entrance, on load or when scrolled into view (motion's whileInView, without React).
 * <h2 [appReveal]="{ opacity: 0, y: 30 }" [delay]="0.1"></h2>
 */
@Directive({ selector: '[appReveal]' })
export class Reveal implements OnInit {
  readonly from = input<From, From | ''>(DEFAULT, { alias: 'appReveal', transform: (v) => v || DEFAULT });
  readonly delay = input(0);
  readonly stiffness = input(120);
  readonly damping = input(18);
  /** 'view' = when it enters the viewport, 'load' = right away */
  readonly on = input<'view' | 'load'>('view');
  readonly margin = input('0px');

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    if (reducedMotion()) return;
    // hide before the first paint so nothing flashes
    animate(this.el, this.from(), { duration: 0 });
  }

  constructor() {
    afterNextRender(() => {
      if (reducedMotion()) return;
      const from = this.from();
      const to = Object.fromEntries(Object.keys(from).map((k) => [k, REST[k as keyof typeof REST]]));
      const play = () => {
        animate(this.el, to, { type: 'spring', stiffness: this.stiffness(), damping: this.damping(), delay: this.delay() });
      };
      if (this.on() === 'load') return play();
      const stop = inView(this.el, () => play(), { margin: this.margin() as never });
      this.destroyRef.onDestroy(stop);
    });
  }
}
