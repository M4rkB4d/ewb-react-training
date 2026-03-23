// TODO: Implement Exercise 2 — Locale Store
// See guide B06 for requirements | Run: npm run test:exercises:08
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface LocaleState { locale: string; setLocale: (locale: string) => void; }
export const useLocaleStore = create<LocaleState>()(
  persist((set) => ({ locale: 'en-US', setLocale: (locale: string) => set({ locale }) }), { name: 'locale-storage' })
);
