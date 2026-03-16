// src/app/intl-provider.tsx
import { IntlProvider } from 'react-intl';
import { useLocaleStore } from '@/stores/locale-store';
import type { ReactNode } from 'react';

// Lazy-loaded message bundles
const messageLoaders: Record<string, () => Promise<Record<string, string>>> = {
  'en-US': () => import('../i18n/messages/en-US.json').then((m) => m.default),
  'fil-PH': () => import('../i18n/messages/fil-PH.json').then((m) => m.default),
  'zh-Hans': () => import('../i18n/messages/zh-Hans.json').then((m) => m.default),
};

import { useState, useEffect } from 'react';

export function AppIntlProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const loader = messageLoaders[locale] ?? messageLoaders['en-US']!;
    loader().then((loaded) => {
      setMessages(loaded);
      setIsLoading(false);
    });
  }, [locale]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en-US">
      {children}
    </IntlProvider>
  );
}
