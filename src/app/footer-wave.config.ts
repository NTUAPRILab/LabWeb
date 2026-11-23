/**
 * Footer dot-wave settings. Tweak these numbers to change the look.
 *
 * Live tuning: open the site with `?wave` at the end of the URL (e.g. http://localhost:4200/?wave),
 * drag the sliders in the panel, then press 「複製設定」 and paste the result here.
 */
export type DotWaveConfig = {
  /** dot colour (any CSS colour) */
  color: string;
  /** overall opacity, 0–1 */
  opacity: number;
  /** animation speed; 0 stops the wave */
  speed: number;
  /** wave frequency: higher = more, tighter ripples */
  frequency: number;
  /** wave height */
  amplitude: number;
  /** grid density: higher = more dots, closer together */
  density: number;
  /** dot radius in px (near dots; far dots shrink with distance) */
  dotSize: number;
  /** band height in px */
  height: number;
  /** how much the pointer pushes a bump into the wave (0 = off) */
  pointer: number;
};

export const footerWave: DotWaveConfig = {
  color: '#3f6b55',
  opacity: 0.9,
  speed: 0.6,
  frequency: 1,
  amplitude: 1,
  density: 0.9,
  dotSize: 2.4,
  height: 300,
  pointer: 1,
};
