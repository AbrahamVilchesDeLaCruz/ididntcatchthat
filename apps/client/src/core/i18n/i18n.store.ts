import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from '@/core/i18n/en';
import { es } from '@/core/i18n/es';
import { type Locale, type Translations } from '@/core/i18n/i18n.types';

const translations: Record<Locale, Translations> = { en, es };

function syncDocumentLang(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

interface I18nState {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      t: translations.en,
      setLocale: (locale) => {
        syncDocumentLang(locale);
        set({ locale, t: translations[locale] });
      },
      toggleLocale: () => {
        const next: Locale = get().locale === 'en' ? 'es' : 'en';
        syncDocumentLang(next);
        set({ locale: next, t: translations[next] });
      },
    }),
    {
      name: 'idct-locale',
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.locale];
          syncDocumentLang(state.locale);
        }
      },
    },
  ),
);
