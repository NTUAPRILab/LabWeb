import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../ui/icon';
import { Reveal } from '../ui/reveal';
import { PhotoHand } from '../ui/photo-hand';
import { DotWave } from '../ui/dot-wave';
import { links } from '../data';
import { galleryPhotos, wix } from '../members-data';
import { footerWave } from '../footer-wave.config';
import { I18nService } from '../lib/i18n';

@Component({
  selector: 'app-footer',
  imports: [Icon, Reveal, PhotoHand, DotWave, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block pt-6' },
  template: `
    <!-- CTA block, aligned with the page's content width -->
    <div class="mx-auto max-w-[1360px] px-4 md:px-8">
      <div class="relative overflow-hidden rounded-[3rem] bg-primary-container text-on-primary-container md:rounded-[4rem]">
        <div>
          <div appReveal class="px-6 pt-12 pb-4 md:px-14 md:pt-14 md:pb-2">
            @if (zh()) {
              <h2 class="text-4xl leading-[1.1] font-bold tracking-[-0.03em] md:text-5xl md:whitespace-nowrap xl:text-6xl">一起把想法，做成摸得到的東西。</h2>
              <p class="mt-4 max-w-md text-lg opacity-80">歡迎參訪、合作與加入 APRILab。</p>
            } @else {
              <h2 class="text-4xl leading-[1.1] font-bold tracking-[-0.03em] md:text-5xl md:whitespace-nowrap xl:text-6xl">Turn ideas into things you can feel.</h2>
              <p class="mt-4 max-w-md text-lg opacity-80">Visits, collaborations, and new members are always welcome at APRILab.</p>
            }
            <div class="mt-6 flex flex-wrap gap-3">
              <a routerLink="/members" class="btn bg-primary text-on-primary hover:bg-[#335a47]">
                {{ zh() ? '認識成員' : 'Meet the Team' }} <svg appIcon="arrow-up-right" class="size-5"></svg>
              </a>
              <a [href]="links.publications" target="_blank" rel="noreferrer" class="btn bg-white/60 text-on-primary-container hover:bg-white">
                {{ zh() ? '學術發表' : 'Publications' }}
              </a>
            </div>
          </div>
          <!-- 活動花絮: cards hang off the bottom edge; the one you point at rises -->
          <app-photo-hand class="relative h-[190px] md:h-[250px]" [images]="photos" [href]="links.gallery" [label]="zh() ? '活動花絮' : 'Gallery'" />
        </div>
      </div>
    </div>

    <div class="mx-auto mt-14 max-w-[1360px] px-4 md:px-8">
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xl font-medium">國立臺灣大學 先進產品實現與互動實驗室</p>
          <p class="text-on-surface-variant">Advanced Product Realization &amp; Interaction Lab</p>
        </div>
        <ul class="flex flex-wrap gap-2">
          @for (l of footerLinks; track l.label) {
            <li>
              @if (l.href.startsWith('/')) {
                <a [routerLink]="l.href" class="inline-block rounded-full bg-surface-high px-4 py-2 text-sm transition hover:bg-primary-container active:scale-95">{{ zh() ? l.label : l.en }}</a>
              } @else {
                <a [href]="l.href" target="_blank" rel="noreferrer" class="inline-block rounded-full bg-surface-high px-4 py-2 text-sm transition hover:bg-primary-container active:scale-95">{{ zh() ? l.label : l.en }}</a>
              }
            </li>
          }
        </ul>
      </div>
    </div>

    <!-- dot wave band; settings live in footer-wave.config.ts -->
    <app-dot-wave class="mt-4" [config]="wave" />

    <div class="mx-auto max-w-[1360px] px-4 md:px-8">
      <div class="flex flex-col gap-2 pb-8 text-sm text-on-surface-variant md:flex-row md:justify-between">
        <span>© {{ year }} APRILab, National Taiwan University</span>
        <span>{{ zh() ? '耶和華是我的牧者；我必不至缺乏。— 詩篇 23:1' : 'The LORD is my shepherd; I shall not want. — Psalm 23:1' }}</span>
      </div>
    </div>
  `,
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  protected readonly zh = computed(() => this.i18n.lang() === 'zh');
  protected readonly links = links;
  protected readonly photos = galleryPhotos.map((id) => wix(id, 640, 480));
  protected readonly wave = footerWave;
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
