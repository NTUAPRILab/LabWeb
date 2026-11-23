import { Injectable, signal } from '@angular/core';

export type Lang = 'zh' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.readInitial());

  toggle() {
    const next: Lang = this.lang() === 'zh' ? 'en' : 'zh';
    this.lang.set(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aprilab-lang', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next === 'zh' ? 'zh-Hant' : 'en';
    }
  }

  private readInitial(): Lang {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('aprilab-lang');
      if (saved === 'en' || saved === 'zh') return saved;
    }
    return 'zh';
  }
}
