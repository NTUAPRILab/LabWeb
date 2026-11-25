import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { Icon } from '../ui/icon';
import { Reveal } from '../ui/reveal';
import { I18nService } from '../lib/i18n';
import { fetchPublicationsFromSheet, type PublicationItem } from '../lib/csv';

const PUBLICATIONS_SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8XCvVrnvRmxu96aZYh9OQ_QEwl6gBgLWUl8olvyngTwWDJKp6LzVUsruV9AhDR_5tGqlEvmgjXcK4/pub?gid=2072252315&single=true&output=csv';

@Component({
  selector: 'app-publications-page',
  imports: [Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block px-4 pt-32 pb-24 md:px-8 md:pt-40' },
  template: `
    <div class="mx-auto max-w-[1360px]">
      <div appReveal>
        <span class="rounded-full bg-surface-high px-4 py-1.5 text-sm font-medium text-on-surface-variant">
          {{ zh() ? '學術發表 · Publications' : 'Publications' }}
        </span>
        <h1 class="mt-6 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">
          {{ zh() ? '期刊論文與研究發表' : 'Refereed Journal Articles' }}
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-on-surface-variant">
          {{ zh() ? '收錄 APRILab 近年發表與已接受之國際期刊論文。' : 'Published and accepted refereed journal articles from NTU APRILab.' }}
        </p>
      </div>

      <!-- Filter bar: year pills + search -->
      <div class="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="inline-flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full bg-surface-high p-1.5 [scrollbar-width:none]">
          @for (y of years(); track y) {
            <button
              type="button"
              (click)="selectedYear.set(y)"
              class="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors active:scale-95"
              [class]="selectedYear() === y ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
            >
              {{ y === 'ALL' ? (zh() ? '全部' : 'All') : y }}
            </button>
          }
        </div>

        <label class="relative block w-full md:w-72">
          <input
            type="search"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            [placeholder]="zh() ? '搜尋作者、標題或期刊…' : 'Search author, title, journal…'"
            class="w-full rounded-full bg-surface-high px-5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-2 focus:outline-primary"
          />
        </label>
      </div>

      @if (loading()) {
        <div class="mt-10 space-y-3">
          @for (n of [1, 2, 3, 4]; track n) {
            <div class="h-28 animate-pulse rounded-[1.75rem] bg-surface-low"></div>
          }
        </div>
      } @else if (error()) {
        <div class="mt-10 rounded-[2rem] bg-surface-low p-8 text-center">
          <p class="text-lg text-on-surface-variant">
            {{ zh() ? '暫時無法載入 Google Sheet 資料，請稍後再試。' : 'Unable to load publications from Google Sheet right now.' }}
          </p>
        </div>
      } @else {
        <p class="mt-6 text-sm text-on-surface-variant">
          {{ zh() ? '共 ' + filtered().length + ' 篇論文' : filtered().length + ' publications' }}
        </p>

        <ul class="mt-4 space-y-3">
          @for (p of filtered(); track p.id; let i = $index) {
            <li
              class="pop-in group flex flex-col gap-3 rounded-[1.75rem] bg-surface-low p-5 transition-[border-radius,background-color] duration-300 hover:rounded-[2.5rem] hover:bg-surface-mid md:flex-row md:items-start md:justify-between md:gap-6 md:p-6"
              [style.animation-delay.ms]="Math.min(i, 12) * 25"
            >
              <div class="flex min-w-0 gap-4 md:gap-5">
                <span class="grid h-11 min-w-16 shrink-0 place-items-center rounded-2xl bg-primary-container px-3 text-sm font-bold text-on-primary-container">
                  {{ p.year || '—' }}
                </span>
                <div class="min-w-0">
                  <p class="text-base leading-relaxed font-medium text-on-surface [overflow-wrap:anywhere] md:text-lg">{{ p.details }}</p>
                  @if (p.authors) {
                    <p class="mt-1.5 text-sm text-on-surface-variant [overflow-wrap:anywhere]">{{ p.authors }}</p>
                  }
                </div>
              </div>
              @if (p.doi) {
                <a
                  [href]="p.doi"
                  target="_blank"
                  rel="noreferrer"
                  class="btn shrink-0 self-start !h-10 bg-surface-high !px-4 text-xs text-on-surface hover:bg-primary hover:text-on-primary"
                >
                  DOI <svg appIcon="arrow-up-right" class="size-4"></svg>
                </a>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class PublicationsPage {
  protected readonly i18n = inject(I18nService);
  protected readonly zh = computed(() => this.i18n.lang() === 'zh');
  protected readonly publications = signal<PublicationItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly selectedYear = signal('ALL');
  protected readonly query = signal('');
  protected readonly Math = Math;

  protected readonly years = computed(() => {
    const set = new Set(this.publications().map((p) => p.year).filter(Boolean));
    return ['ALL', ...Array.from(set).sort((a, b) => Number(b) - Number(a))];
  });

  protected readonly filtered = computed(() => {
    const y = this.selectedYear();
    const q = this.query().trim().toLowerCase();
    return this.publications().filter((p) => {
      if (y !== 'ALL' && p.year !== y) return false;
      if (!q) return true;
      return p.full.toLowerCase().includes(q);
    });
  });

  constructor() {
    afterNextRender(() => {
      fetchPublicationsFromSheet(PUBLICATIONS_SHEET_CSV)
        .then((rows) => {
          this.publications.set(rows);
          this.loading.set(false);
        })
        .catch(() => {
          this.error.set(true);
          this.loading.set(false);
        });
    });
  }
}
