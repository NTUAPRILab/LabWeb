/** Small animation helpers shared by the components. */

export const SPRING = { type: 'spring', stiffness: 260, damping: 18 } as const;

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Linear map with clamping, like motion's useTransform(progress, [a, b], [c, d]). */
export function map(p: number, [a, b]: [number, number], [c, d]: [number, number]) {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return c + (d - c) * t;
}

/** Damped spring integrator for per-frame driven values (mouse parallax etc.). */
export class Spring {
  value: number;
  velocity = 0;
  target: number;
  constructor(v = 0, public stiffness = 60, public damping = 14) {
    this.value = this.target = v;
  }
  step(dt: number) {
    const sub = Math.ceil(dt / (1 / 240));
    const h = dt / sub;
    for (let i = 0; i < sub; i++) {
      this.velocity += ((this.target - this.value) * this.stiffness - this.velocity * this.damping) * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
  get settled() {
    return Math.abs(this.velocity) < 0.01 && Math.abs(this.target - this.value) < 0.01;
  }
}

/** Page scroll velocity in px/s, decaying to 0 when the page stops. */
class ScrollVelocity {
  value = 0;
  private lastY = 0;
  private lastT = 0;
  private started = false;
  start() {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    this.lastY = window.scrollY;
    this.lastT = performance.now();
    window.addEventListener(
      'scroll',
      () => {
        const now = performance.now();
        const dt = Math.max(1, now - this.lastT);
        const v = ((window.scrollY - this.lastY) / dt) * 1000;
        this.value = this.value * 0.6 + v * 0.4;
        this.lastY = window.scrollY;
        this.lastT = now;
      },
      { passive: true },
    );
    const decay = () => {
      if (performance.now() - this.lastT > 80) this.value *= 0.85;
      requestAnimationFrame(decay);
    };
    requestAnimationFrame(decay);
  }
}
export const scrollVelocity = new ScrollVelocity();
