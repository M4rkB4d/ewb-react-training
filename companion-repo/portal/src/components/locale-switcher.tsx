// src/components/locale-switcher.tsx
import { useLocaleStore } from '@/stores/locale-store';

const locales = [
  { code: 'en-US' as const, label: 'English', flag: 'EN' },
  { code: 'fil-PH' as const, label: 'Filipino', flag: 'FIL' },
  { code: 'zh-Hans' as const, label: '中文', flag: '中' },
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      aria-label="Select language"
      className="rounded border px-2 py-1 text-sm"
    >
      {locales.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {loc.flag} {loc.label}
        </option>
      ))}
    </select>
  );
}
