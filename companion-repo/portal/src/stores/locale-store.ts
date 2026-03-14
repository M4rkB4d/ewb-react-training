// src/stores/locale-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en-US' | 'fil-PH' | 'zh-Hans';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en-US',
      setLocale: (locale) => {
        document.documentElement.lang = locale;
        set({ locale });
      },
    }),
    { name: 'ewb-locale' },
  ),
);
