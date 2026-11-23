import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Icon } from './icon';
import { I18nService } from '../lib/i18n';

export type VideoItem = { id: string; title: string; category: string; en: string; src: string };

/**
 * Video sheet. The header row keeps the category/title and the close button on one baseline,
 * and the player is sized from the viewport height, so the whole sheet fits even when Windows
 * display scaling (125% / 150%) makes the browser viewport short.
 */
@Component({
  selector: 'app-video-dialog',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="fixed inset-0 z-[70] grid place-items-center p-3 md:p-6" role="dialog" aria-modal="true" [attr.aria-label]="title()">
      <div class="fade-in absolute inset-0 bg-[#191c1a]/60 backdrop-blur-lg" (click)="closed.emit()"></div>
      <div class="sheet-in relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-[2rem] bg-surface p-5 md:max-h-[calc(100dvh-3rem)] md:rounded-[2.5rem] md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm font-medium text-primary md:text-base">{{ item().category }}</p>
            <h3 class="mt-1 text-2xl leading-tight font-semibold text-on-surface md:text-4xl">{{ title() }}</h3>
            <p class="mt-1 text-on-surface-variant md:text-lg">{{ subtitle() }}</p>
          </div>
          <button
            class="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition hover:bg-[#335a47] active:scale-90"
            (click)="closed.emit()"
            [attr.aria-label]="i18n.lang() === 'zh' ? '關閉' : 'Close'"
          >
            <svg appIcon="x" class="size-6"></svg>
          </button>
        </div>
        <div class="mx-auto mt-5 aspect-video shrink-0 overflow-hidden rounded-[1.5rem] bg-on-surface md:mt-6" style="width: min(100%, calc((100dvh - 15rem) * 16 / 9))">
          <iframe class="h-full w-full" [src]="embed()" [title]="item().en" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `,
})
export class VideoDialog {
  protected readonly i18n = inject(I18nService);
  readonly item = input.required<VideoItem>();
  readonly closed = output<void>();

  private readonly sanitizer = inject(DomSanitizer);
  protected readonly embed = computed(() =>
    // the id comes from our own data file, never from user input
    this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${this.item().id}?rel=0&autoplay=1`),
  );
  protected readonly title = computed(() => (this.i18n.lang() === 'zh' ? this.item().title : this.item().en));
  protected readonly subtitle = computed(() => (this.i18n.lang() === 'zh' ? this.item().en : this.item().title));

  constructor() {
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));
  }
}
