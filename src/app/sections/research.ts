import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Morph } from '../ui/morph';
import { Reveal } from '../ui/reveal';
import { CountUp } from '../ui/count-up';
import { research, stats } from '../data';
import { I18nService } from '../lib/i18n';
import type { ShapeName } from '../lib/shapes';

const looks: { bg: string; shape: string; shapes: ShapeName[] }[] = [
  { bg: 'bg-primary-container text-on-primary-container md:col-span-7', shape: '#3f6b55', shapes: ['cookie', 'flower', 'clover'] },
  { bg: 'bg-tertiary-container text-on-tertiary-container md:col-span-5', shape: '#7c5800', shapes: ['clover', 'sunny', 'gem'] },
  { bg: 'bg-secondary-container text-on-secondary-container md:col-span-5', shape: '#4f6356', shapes: ['flower', 'squircle', 'cookie'] },
  { bg: 'bg-surface-high text-on-surface md:col-span-7', shape: '#3f6b55', shapes: ['squircle', 'gem', 'sunny'] },
];
const statShapes: ShapeName[][] = [['cookie', 'sunny'], ['clover', 'flower'], ['sunny', 'gem'], ['flower', 'cookie']];
const statColors = ['#c1ecd5', '#ffdea6', '#d2e8d7', '#c1ecd5'];

@Component({
  selector: 'app-research',
  imports: [Morph, Reveal, CountUp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'research', class: 'relative block scroll-mt-24 px-4 py-24 md:px-8 md:py-32' },
  template: `
    <div class="mx-auto max-w-[1360px]">
      <div appReveal class="mb-14 max-w-3xl">
        <span class="rounded-full bg-surface-high px-4 py-1.5 text-sm font-medium text-on-surface-variant">{{ i18n.lang() === 'zh' ? '研究領域 · Research' : 'Research' }}</span>
        @if (i18n.lang() === 'zh') {
          <h2 class="mt-6 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">
            四個方向，<br />一個問題：<span class="text-primary">感覺得到嗎？</span>
          </h2>
        } @else {
          <h2 class="mt-6 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">
            Four directions,<br />one question: <span class="text-primary">can you feel it?</span>
          </h2>
        }
      </div>

      <div class="grid gap-4 md:grid-cols-12">
        @for (r of research; track r.no; let i = $index) {
          <article
            [appReveal]="{ opacity: 0, y: 60, scale: 0.96 }"
            [delay]="(i % 2) * 0.1"
            [stiffness]="110"
            [damping]="16"
            margin="-60px"
            class="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[2.5rem] p-8 transition-[border-radius] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rounded-[4.5rem] md:p-10 {{ looks[i].bg }}"
          >
            <svg
              appMorph
              [shapes]="looks[i].shapes"
              [color]="looks[i].shape"
              [spin]="i % 2 ? -12 : 12"
              class="absolute -top-10 -right-10 w-44 opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-1.5rem] group-hover:translate-y-6 group-hover:scale-125 md:w-56"
            ></svg>
            <span class="relative text-sm font-medium opacity-70">{{ r.no }} · {{ i18n.lang() === 'zh' ? r.en : r.zh }}</span>
            <div class="relative">
              <h3 class="text-4xl font-bold tracking-tight md:text-6xl">{{ i18n.lang() === 'zh' ? r.zh : r.en }}</h3>
              <p class="mt-4 max-w-lg text-lg leading-relaxed opacity-80">{{ i18n.lang() === 'zh' ? r.body : r.bodyEn }}</p>
              <div class="mt-6 flex flex-wrap gap-2">
                @for (t of (i18n.lang() === 'zh' ? r.tags : r.tagsEn); track t) {
                  <span class="rounded-full border border-current/20 px-4 py-1.5 text-sm">{{ t }}</span>
                }
              </div>
            </div>
          </article>
        }
      </div>

      <div class="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
        @for (s of stats; track s.label; let i = $index) {
          <div [appReveal]="{ opacity: 0, scale: 0.6 }" [delay]="i * 0.08" [stiffness]="160" [damping]="12" class="flex flex-col items-center text-center">
            <div class="relative grid aspect-square w-full max-w-[220px] place-items-center">
              <svg appMorph [shapes]="statShapes[i]" [color]="statColors[i]" [spin]="i % 2 ? -10 : 10" [every]="2600 + i * 300" [hoverMorph]="false" class="absolute inset-0 h-full w-full"></svg>
              <div class="relative flex items-baseline text-5xl font-bold tracking-tight text-on-surface md:text-6xl">
                <app-count-up [to]="s.value" />
                <span class="ml-0.5 text-2xl">{{ i18n.lang() === 'zh' ? s.suffix : s.suffixEn }}</span>
              </div>
            </div>
            <p class="mt-4 text-lg font-medium">{{ i18n.lang() === 'zh' ? s.label : s.labelEn }}</p>
            <p class="text-sm text-on-surface-variant">{{ s.note }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class Research {
  protected readonly i18n = inject(I18nService);
  protected readonly research = research;
  protected readonly stats = stats;
  protected readonly looks = looks;
  protected readonly statShapes = statShapes;
  protected readonly statColors = statColors;
}
