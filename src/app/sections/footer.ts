import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Icon } from '../ui/icon';
import { Reveal } from '../ui/reveal';
import { BounceCards } from '../ui/bounce-cards';
import { bounceImages, links } from '../data';
import { I18nService } from '../lib/i18n';

/** M3 Expressive "wavy" line, drifting sideways. */
const wave = Array.from({ length: 41 }, (_, i) => `${i === 0 ? 'M' : 'L'}${i * 10} ${10 + Math.sin(i * 0.9) * 6}`).join(' ');

@Component({
  selector: 'app-footer',
  imports: [Icon, Reveal, BounceCards],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block px-3 pb-3 md:px-4 md:pb-4' },
  template: `
    <div class="overflow-hidden rounded-[3rem] bg-primary-container px-6 py-16 text-on-primary-container md:rounded-[4rem] md:px-14 md:py-20">
      <div class="grid items-center gap-12 md:grid-cols-2">
        <div appReveal>
          @if (i18n.lang() === 'zh') {
            <h2 class="text-4xl leading-[1.05] font-bold tracking-[-0.03em] [text-wrap:balance] md:text-6xl">一起把想法，<br />做成摸得到的東西。</h2>
            <p class="mt-6 max-w-md text-lg opacity-80">歡迎參訪、合作與加入 APRILab。</p>
          } @else {
            <h2 class="text-4xl leading-[1.05] font-bold tracking-[-0.03em] [text-wrap:balance] md:text-6xl">Turn ideas into<br />things you can feel.</h2>
            <p class="mt-6 max-w-md text-lg opacity-80">Visits, collaborations, and new members are always welcome at APRILab.</p>
          }
          <div class="mt-8 flex flex-wrap gap-3">
            <a [href]="links.members" target="_blank" rel="noreferrer" class="btn bg-primary text-on-primary hover:bg-[#335a47]">
              {{ i18n.lang() === 'zh' ? '認識成員' : 'Meet the Team' }} <svg appIcon="arrow-up-right" class="size-5"></svg>
            </a>
            <a [href]="links.publications" target="_blank" rel="noreferrer" class="btn bg-white/60 text-on-primary-container hover:bg-white">
              {{ i18n.lang() === 'zh' ? '學術發表' : 'Publications' }}
            </a>
          </div>
        </div>
        <div class="flex justify-center">
          <app-bounce-cards
            class="max-md:scale-[0.72]"
            [images]="bounceImages"
            [containerWidth]="460"
            [containerHeight]="300"
            [cardSize]="190"
            [spread]="70"
            [rotation]="8"
            [radius]="36"
            [borderWidth]="6"
            borderColor="#f6fbf4"
            [animationDelay]="0.3"
            [bounciness]="0.7"
            [pushDistance]="120"
          />
        </div>
      </div>
    </div>

    <div class="mx-auto mt-10 max-w-[1360px] px-4 md:px-8">
      <div class="overflow-hidden">
        <svg viewBox="0 0 400 20" class="wavy h-5 w-[200%]" preserveAspectRatio="none" aria-hidden="true">
          <path [attr.d]="wave" fill="none" stroke="#3f6b55" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        </svg>
      </div>
      <div class="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xl font-medium">國立臺灣大學 先進產品實現與互動實驗室</p>
          <p class="text-on-surface-variant">Advanced Product Realization &amp; Interaction Lab</p>
        </div>
        <ul class="flex flex-wrap gap-2">
          @for (l of footerLinks; track l.label) {
            <li>
              <a [href]="l.href" target="_blank" rel="noreferrer" class="inline-block rounded-full bg-surface-high px-4 py-2 text-sm transition hover:bg-primary-container active:scale-95">
                {{ i18n.lang() === 'zh' ? l.label : l.en }}
              </a>
            </li>
          }
        </ul>
      </div>
      <div class="mt-10 flex flex-col gap-2 pb-6 text-sm text-on-surface-variant md:flex-row md:justify-between">
        <span>© {{ year }} APRILab, National Taiwan University</span>
        <span>{{ i18n.lang() === 'zh' ? '耶和華是我的牧者；我必不至缺乏。— 詩篇 23:1' : 'The LORD is my shepherd; I shall not want. — Psalm 23:1' }}</span>
      </div>
    </div>
  `,
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  protected readonly links = links;
  protected readonly bounceImages = bounceImages;
  protected readonly wave = wave;
  protected readonly year = new Date().getFullYear();
  protected readonly footerLinks = [
    { label: '學術發表', en: 'Publications', href: links.publications },
    { label: '專利發表', en: 'Patents', href: links.patents },
    { label: '實驗室成員', en: 'Members', href: links.members },
    { label: '活動花絮', en: 'Gallery', href: links.gallery },
    { label: 'YouTube', en: 'YouTube', href: links.youtube },
    { label: 'Lab Server', en: 'Lab Server', href: links.server },
  ];
}
