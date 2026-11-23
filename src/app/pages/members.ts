import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../ui/icon';
import { Morph } from '../ui/morph';
import { Reveal } from '../ui/reveal';
import { I18nService } from '../lib/i18n';
import { alumni, professor, roleLabel, students, wix, type Member } from '../members-data';
import type { ShapeName } from '../lib/shapes';

const placeholderShapes: ShapeName[][] = [['cookie', 'flower'], ['clover', 'sunny'], ['flower', 'gem']];
const placeholderColors = ['#c1ecd5', '#ffdea6', '#d2e8d7'];

@Component({
  selector: 'app-members-page',
  imports: [NgTemplateOutlet, Icon, Morph, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block px-4 pt-28 pb-24 md:px-8 md:pt-36' },
  template: `
    <div class="mx-auto max-w-[1360px]">
      <header appReveal on="load" class="max-w-3xl">
        <span class="rounded-full bg-surface-high px-4 py-1.5 text-sm font-medium text-on-surface-variant">{{ zh() ? '實驗室成員 · Members' : 'Members' }}</span>
        <h1 class="mt-6 text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">
          @if (zh()) { 做出這些東西的<span class="text-primary">人。</span> } @else { The people <span class="text-primary">behind the work.</span> }
        </h1>
      </header>

      <!-- professor -->
      <section
        [appReveal]="{ opacity: 0, y: 50, scale: 0.97 }"
        on="load"
        [delay]="0.15"
        class="mt-14 overflow-hidden rounded-[2.5rem] bg-primary-container text-on-primary-container md:rounded-[3.5rem]"
      >
        <div class="grid items-center gap-8 p-6 md:grid-cols-[minmax(0,360px)_1fr] md:gap-14 md:p-12">
          <svg appMorph [shapes]="['cookie', 'squircle', 'flower']" [image]="profPhoto" [spin]="4" [every]="5200" class="mx-auto w-full max-w-[320px] drop-shadow-[0_20px_40px_rgba(0,33,20,0.18)]"></svg>
          <div>
            <p class="text-sm font-medium tracking-wide opacity-70">{{ zh() ? '指導教授 · Principal Investigator' : 'Principal Investigator' }}</p>
            <h2 class="mt-3 text-5xl font-bold tracking-tight md:text-7xl">{{ zh() ? prof.zh : prof.en }}</h2>
            <p class="mt-2 text-xl md:text-2xl">{{ zh() ? prof.en + ' · ' + prof.titleZh : prof.zh + ' · ' + prof.titleEn }}</p>
            <p class="mt-1 opacity-75">{{ zh() ? prof.deptZh : prof.deptEn }}</p>
            <div class="mt-8 flex flex-wrap gap-3">
              <button class="btn bg-primary text-on-primary hover:bg-[#335a47]" (click)="profOpen.set(!profOpen())" [attr.aria-expanded]="profOpen()" aria-controls="prof-details">
                {{ zh() ? '聯絡方式與經歷' : 'Contact & experience' }}
                <svg appIcon="arrow-down" class="size-5 transition-transform duration-500" [class.rotate-180]="profOpen()"></svg>
              </button>
              <a [href]="'mailto:' + prof.email" class="btn bg-white/60 hover:bg-white">{{ prof.email }}</a>
            </div>
          </div>
        </div>

        <div id="prof-details" class="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.34,1.2,0.64,1)]" [style.grid-template-rows]="profOpen() ? '1fr' : '0fr'">
          <div class="overflow-hidden">
            <div class="grid gap-4 px-6 pb-6 md:grid-cols-3 md:px-12 md:pb-12" [class.invisible]="!profOpen()">
              <div class="rounded-[2rem] bg-white/55 p-6">
                <h3 class="text-lg font-bold">{{ zh() ? '聯絡方式' : 'Contact' }}</h3>
                <dl class="mt-4 space-y-3 text-[15px]">
                  <div><dt class="text-sm opacity-60">Email</dt><dd><a class="underline-offset-4 hover:underline" [href]="'mailto:' + prof.email">{{ prof.email }}</a></dd></div>
                  <div><dt class="text-sm opacity-60">Tel</dt><dd>{{ prof.tel }}</dd></div>
                  <div><dt class="text-sm opacity-60">Fax</dt><dd>{{ prof.fax }}</dd></div>
                  <div><dt class="text-sm opacity-60">{{ zh() ? '實驗室電話' : 'Lab' }}</dt><dd>{{ prof.labTel }}</dd></div>
                  <div><dt class="text-sm opacity-60">{{ zh() ? '地址' : 'Address' }}</dt><dd>{{ zh() ? prof.addressZh : prof.addressEn }}</dd></div>
                </dl>
              </div>
              <div class="rounded-[2rem] bg-white/55 p-6">
                <h3 class="text-lg font-bold">{{ zh() ? '學歷' : 'Education' }}</h3>
                <ul class="mt-4 space-y-3 text-[15px]">
                  @for (e of prof.education; track e.en) { <li class="flex gap-3"><span class="mt-2 size-2 shrink-0 rounded-full bg-primary"></span>{{ zh() ? e.zh : e.en }}</li> }
                </ul>
              </div>
              <div class="rounded-[2rem] bg-white/55 p-6">
                <h3 class="text-lg font-bold">{{ zh() ? '經歷' : 'Experience' }}</h3>
                <ul class="mt-4 space-y-3 text-[15px]">
                  @for (e of prof.experience; track e.en) { <li class="flex gap-3"><span class="mt-2 size-2 shrink-0 rounded-full bg-tertiary"></span>{{ zh() ? e.zh : e.en }}</li> }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- current students -->
      <section class="mt-24">
        <div appReveal class="flex flex-wrap items-end justify-between gap-4">
          <h2 class="text-4xl font-bold tracking-tight md:text-6xl">{{ zh() ? '研究生' : 'Graduate students' }}</h2>
          <p class="text-on-surface-variant">{{ students.length }} {{ zh() ? '位在學成員' : 'current members' }}</p>
        </div>
        <ul class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          @for (s of students; track s.email; let i = $index) {
            <li [appReveal]="{ opacity: 0, y: 40, scale: 0.95 }" [delay]="(i % 5) * 0.05" [stiffness]="140" [damping]="16">
              <ng-container *ngTemplateOutlet="card; context: { $implicit: s, i: i }" />
            </li>
          }
        </ul>
      </section>

      <!-- alumni, hidden until asked for -->
      <section class="mt-24">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-4xl font-bold tracking-tight md:text-6xl">{{ zh() ? '畢業生' : 'Alumni' }}</h2>
            <p class="mt-2 text-on-surface-variant">{{ alumni.length }} {{ zh() ? '位畢業成員，現在在各地繼續做摸得到的東西。' : 'graduates, now building tangible things everywhere.' }}</p>
          </div>
          <button class="btn bg-secondary-container text-on-secondary-container hover:bg-primary-container" (click)="showAlumni.set(!showAlumni())" [attr.aria-expanded]="showAlumni()">
            {{ showAlumni() ? (zh() ? '收合畢業生' : 'Hide alumni') : (zh() ? '顯示畢業生' : 'Show alumni') }}
            <svg appIcon="arrow-down" class="size-5 transition-transform duration-500" [class.rotate-180]="showAlumni()"></svg>
          </button>
        </div>
        @if (showAlumni()) {
          <ul class="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" animate.leave="fade-out">
            @for (a of alumni; track a.email; let i = $index) {
              <li class="pop-in" [style.animation-delay.ms]="Math.min(i, 24) * 25">
                <ng-container *ngTemplateOutlet="card; context: { $implicit: a, i: i, small: true }" />
              </li>
            }
          </ul>
        }
      </section>
    </div>

    <ng-template #card let-m let-i="i" let-small="small">
      <figure class="group">
        <div
          class="relative aspect-[4/5] overflow-hidden bg-surface-high transition-[border-radius,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1.5"
          [class]="small ? 'rounded-[1.5rem] group-hover:rounded-[2.5rem]' : 'rounded-[2rem] group-hover:rounded-[3.5rem]'"
        >
          @if (m.photo) {
            <img
              [src]="photo(m.photo, small)"
              [alt]="m.name"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              [class]="small ? 'grayscale-[0.35] group-hover:grayscale-0' : ''"
            />
          } @else {
            <div class="grid h-full w-full place-items-center">
              <svg appMorph [shapes]="placeholderShapes[i % 3]" [color]="placeholderColors[i % 3]" [spin]="8" class="absolute w-3/4"></svg>
              <span class="relative text-4xl font-bold text-on-surface">{{ m.name.slice(-2) }}</span>
            </div>
          }
        </div>
        <figcaption class="mt-3 px-1">
          <p class="font-bold" [class]="small ? 'text-base' : 'text-lg'">{{ m.name }}</p>
          <p class="text-sm text-on-surface-variant">{{ role(m) }}</p>
          @if (!small) {
            <a [href]="'mailto:' + m.email" class="mt-1 block truncate text-sm text-primary underline-offset-4 hover:underline">{{ m.email.toLowerCase() }}</a>
          }
        </figcaption>
      </figure>
    </ng-template>
  `,
})
export class MembersPage {
  protected readonly i18n = inject(I18nService);
  protected readonly zh = computed(() => this.i18n.lang() === 'zh');
  protected readonly prof = professor;
  protected readonly profPhoto = wix(professor.photo, 800, 800);
  protected readonly students = students;
  protected readonly alumni = alumni;
  protected readonly placeholderShapes = placeholderShapes;
  protected readonly placeholderColors = placeholderColors;
  protected readonly profOpen = signal(false);
  protected readonly showAlumni = signal(false);
  protected readonly Math = Math;

  protected photo(id: string, small: boolean) {
    return small ? wix(id, 300, 375) : wix(id, 480, 600);
  }

  protected role(m: Member) {
    const r = roleLabel[m.role];
    if (this.alumni.includes(m)) return this.zh() ? (m.role === 'phd' ? '博士畢業' : '碩士畢業') : m.role === 'phd' ? 'Ph.D. alum' : 'M.S. alum';
    return this.zh() ? r.zh : r.en;
  }
}
