import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal, viewChild } from '@angular/core';
import { animate, stagger } from 'motion';
import { reducedMotion } from '../lib/anim';

/** Pill whose word rotates letter by letter; the pill springs to the new width. */
@Component({
  selector: 'app-rotating-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span class="sr-only" aria-live="polite">{{ current() }}</span>
    <span #pill aria-hidden="true" class="relative inline-flex overflow-hidden rounded-full bg-tertiary-container px-5 py-1.5 font-medium whitespace-nowrap text-on-tertiary-container">
      <span #word class="inline-flex"></span>
    </span>
  `,
})
export class RotatingText {
  readonly texts = input.required<string[]>();
  readonly interval = input(2400);

  protected readonly current = signal('');
  private readonly pill = viewChild.required<ElementRef<HTMLElement>>('pill');
  private readonly word = viewChild.required<ElementRef<HTMLElement>>('word');

  constructor() {
    const destroyRef = inject(DestroyRef);
    const spring = { type: 'spring', damping: 26, stiffness: 380 } as const;

    afterNextRender(() => {
      const pill = this.pill().nativeElement;
      const word = this.word().nativeElement;
      let i = 0;

      const fill = (text: string) => {
        word.replaceChildren(
          ...Array.from(text).map((ch) => {
            const clip = document.createElement('span');
            clip.className = 'inline-block overflow-hidden';
            const c = document.createElement('span');
            c.className = 'inline-block';
            c.textContent = ch === ' ' ? ' ' : ch;
            clip.append(c);
            return clip;
          }),
        );
        this.current.set(text);
        return word.querySelectorAll<HTMLElement>(':scope > span > span');
      };

      const first = fill(this.texts()[0]);
      if (!reducedMotion()) animate(first, { y: ['100%', 0] }, { ...spring, delay: stagger(0.025, { from: 'last', startDelay: 0.7 }) });

      const tick = async () => {
        const texts = this.texts();
        i = (i + 1) % texts.length;
        if (reducedMotion()) return void fill(texts[i]);
        const from = pill.offsetWidth;
        await animate(word.querySelectorAll(':scope > span > span'), { y: '-120%' }, { ...spring, delay: stagger(0.02, { from: 'last' }) });
        const chars = fill(texts[i]);
        chars.forEach((c) => (c.style.transform = 'translateY(100%)'));
        pill.style.width = 'auto';
        const to = pill.offsetWidth;
        animate(pill, { width: [from + 'px', to + 'px'] }, { type: 'spring', stiffness: 300, damping: 26 });
        animate(chars, { y: ['100%', 0] }, { ...spring, delay: stagger(0.025, { from: 'last' }) });
      };
      const timer = setInterval(tick, this.interval());
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
