// Polar "expressive" shapes in the spirit of Material 3 Expressive's shape library.
// Every shape uses the same number of points, so any two can be morphed by lerping radii.

export const N = 144;

export type ShapeName = 'circle' | 'cookie' | 'clover' | 'flower' | 'sunny' | 'squircle' | 'gem';

const wave = (k: number, a: number) => (t: number) => (1 + a * Math.cos(k * t)) / (1 + a);

const fns: Record<ShapeName, (t: number) => number> = {
  circle: () => 1,
  cookie: wave(9, 0.07),
  clover: wave(4, 0.2),
  flower: wave(6, 0.13),
  sunny: wave(12, 0.055),
  gem: wave(5, 0.1),
  squircle: (t) => {
    const n = 4;
    const r = Math.pow(Math.pow(Math.abs(Math.cos(t)), n) + Math.pow(Math.abs(Math.sin(t)), n), -1 / n);
    return r / Math.SQRT2 ** 0.5;
  },
};

export function radii(name: ShapeName): Float32Array {
  const out = new Float32Array(N);
  let max = 0;
  for (let i = 0; i < N; i++) {
    out[i] = fns[name]((i / N) * Math.PI * 2);
    max = Math.max(max, out[i]);
  }
  for (let i = 0; i < N; i++) out[i] /= max;
  return out;
}

/** Path in a 0..1 box. */
export function toPath(r: Float32Array, rotation = 0): string {
  let d = '';
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2 + rotation;
    const x = 0.5 + 0.5 * r[i] * Math.cos(t);
    const y = 0.5 + 0.5 * r[i] * Math.sin(t);
    d += (i ? 'L' : 'M') + x.toFixed(4) + ' ' + y.toFixed(4);
  }
  return d + 'Z';
}
