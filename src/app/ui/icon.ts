import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { icons } from '../lib/icons';

/** Lucide icon: <svg appIcon="play" class="size-5"></svg> */
@Component({
  selector: 'svg[appIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  },
  template: `
    @for (n of nodes(); track $index) {
      @switch (n[0]) {
        @case ('path') { <svg:path [attr.d]="n[1]['d']" /> }
        @case ('circle') { <svg:circle [attr.cx]="n[1]['cx']" [attr.cy]="n[1]['cy']" [attr.r]="n[1]['r']" /> }
        @case ('rect') { <svg:rect [attr.x]="n[1]['x']" [attr.y]="n[1]['y']" [attr.width]="n[1]['width']" [attr.height]="n[1]['height']" [attr.rx]="n[1]['rx']" /> }
      }
    }
  `,
})
export class Icon {
  readonly name = input.required<string>({ alias: 'appIcon' });
  protected readonly nodes = computed(() => icons[this.name()] ?? []);
}
