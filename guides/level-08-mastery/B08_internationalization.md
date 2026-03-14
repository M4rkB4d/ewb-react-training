# B08 — Internationalization

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 8 — Mastery · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Set up react-intl for internationalization (i18n)
- Create message catalogs for English, Filipino, and Chinese
- Format Philippine Peso currency and dates by locale
- Handle pluralization and gender-aware messages
- Build a locale switcher component
- Implement locale-aware number formatting for banking
- Load locale data on demand (code splitting)

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B02 — Routing and Navigation | Level 4 |
| Completed A06 — Design System Foundations | Level 3 |

---

## Phase 1 — Setup

### Installing react-intl

```bash
npm install react-intl
```

### Provider configuration

```tsx
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
    const loader = messageLoaders[locale] ?? messageLoaders['en-US'];
    loader!().then((loaded) => {
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
```

### Locale store

```tsx
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
```

### Checkpoint 1

Why are message bundles loaded lazily instead of bundling all locales together?
What would happen to the initial bundle size if all three locales were included?

Answer: Each locale file can be 20-50KB. Including all three would add 60-150KB
to the initial bundle that most users never need — most EWB users use English.
Lazy loading means only the active locale is downloaded.

---

## Phase 2 — Message Catalogs

### English (default)

```json
// src/i18n/messages/en-US.json
{
  "app.title": "EastWest Digital Banking",
  "nav.dashboard": "Dashboard",
  "nav.accounts": "Accounts",
  "nav.transfers": "Transfers",
  "nav.payments": "Payments",
  "nav.settings": "Settings",

  "dashboard.greeting": "Welcome, {name}",
  "dashboard.lastLogin": "Last login: {date}",

  "accounts.title": "Your Accounts",
  "accounts.balance": "Available Balance",
  "accounts.transactions": "Transaction History",
  "accounts.noTransactions": "No transactions found.",

  "transfer.title": "Fund Transfer",
  "transfer.from": "From Account",
  "transfer.to": "To Account",
  "transfer.amount": "Amount",
  "transfer.notes": "Notes (optional)",
  "transfer.confirm": "Confirm Transfer",
  "transfer.success": "Transfer of {amount} completed successfully.",
  "transfer.reference": "Reference: {reference}",

  "auth.login": "Sign In",
  "auth.username": "Username",
  "auth.password": "Password",
  "auth.mfa.title": "Two-Factor Authentication",
  "auth.mfa.prompt": "Enter the 6-digit code from your authenticator app.",
  "auth.logout": "Sign Out",
  "auth.session.warning": "Your session will expire in {minutes, plural, one {# minute} other {# minutes}}.",
  "auth.session.extend": "Stay Signed In",

  "errors.network": "Unable to connect. Please check your internet connection.",
  "errors.generic": "Something went wrong. Please try again.",
  "errors.insufficientFunds": "Insufficient funds. Available balance: {balance}.",

  "common.submit": "Submit",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.next": "Next",
  "common.back": "Back",
  "common.loading": "Loading...",
  "common.retry": "Try Again"
}
```

### Filipino

```json
// src/i18n/messages/fil-PH.json
{
  "app.title": "EastWest Digital Banking",
  "nav.dashboard": "Dashboard",
  "nav.accounts": "Mga Account",
  "nav.transfers": "Paglipat ng Pondo",
  "nav.payments": "Mga Bayarin",
  "nav.settings": "Mga Setting",

  "dashboard.greeting": "Mabuhay, {name}",
  "dashboard.lastLogin": "Huling login: {date}",

  "accounts.title": "Iyong Mga Account",
  "accounts.balance": "Available na Balanse",
  "accounts.transactions": "Kasaysayan ng Transaksyon",
  "accounts.noTransactions": "Walang nahanap na transaksyon.",

  "transfer.title": "Paglipat ng Pondo",
  "transfer.from": "Mula sa Account",
  "transfer.to": "Papunta sa Account",
  "transfer.amount": "Halaga",
  "transfer.notes": "Mga Tala (opsyonal)",
  "transfer.confirm": "Kumpirmahin ang Paglipat",
  "transfer.success": "Matagumpay na nailipat ang {amount}.",
  "transfer.reference": "Reference: {reference}",

  "auth.login": "Mag-sign In",
  "auth.username": "Username",
  "auth.password": "Password",
  "auth.mfa.title": "Two-Factor Authentication",
  "auth.mfa.prompt": "Ilagay ang 6 na digit code mula sa iyong authenticator app.",
  "auth.logout": "Mag-sign Out",
  "auth.session.warning": "Mag-e-expire ang iyong session sa {minutes, plural, one {# minuto} other {# minuto}}.",
  "auth.session.extend": "Manatiling Naka-sign In",

  "errors.network": "Hindi makakonekta. Pakisuri ang iyong internet connection.",
  "errors.generic": "May nangyaring mali. Pakisubukan muli.",
  "errors.insufficientFunds": "Kulang ang pondo. Available na balanse: {balance}.",

  "common.submit": "Isumite",
  "common.cancel": "Kanselahin",
  "common.save": "I-save",
  "common.next": "Susunod",
  "common.back": "Bumalik",
  "common.loading": "Naglo-load...",
  "common.retry": "Subukan Muli"
}
```

### Chinese (Simplified)

```json
// src/i18n/messages/zh-Hans.json
{
  "app.title": "EastWest 数字银行",
  "nav.dashboard": "仪表板",
  "nav.accounts": "账户",
  "nav.transfers": "转账",
  "nav.payments": "付款",
  "nav.settings": "设置",

  "dashboard.greeting": "欢迎，{name}",
  "dashboard.lastLogin": "上次登录：{date}",

  "accounts.title": "您的账户",
  "accounts.balance": "可用余额",
  "accounts.transactions": "交易记录",
  "accounts.noTransactions": "未找到交易记录。",

  "transfer.title": "资金转账",
  "transfer.from": "转出账户",
  "transfer.to": "转入账户",
  "transfer.amount": "金额",
  "transfer.notes": "备注（可选）",
  "transfer.confirm": "确认转账",
  "transfer.success": "成功转账 {amount}。",
  "transfer.reference": "参考编号：{reference}",

  "auth.login": "登录",
  "auth.username": "用户名",
  "auth.password": "密码",
  "auth.mfa.title": "双重身份验证",
  "auth.mfa.prompt": "请输入验证器应用中的6位数字代码。",
  "auth.logout": "退出登录",
  "auth.session.warning": "您的会话将在 {minutes, plural, other {# 分钟}}后过期。",
  "auth.session.extend": "保持登录",

  "errors.network": "无法连接。请检查您的网络连接。",
  "errors.generic": "出了点问题。请重试。",
  "errors.insufficientFunds": "余额不足。可用余额：{balance}。",

  "common.submit": "提交",
  "common.cancel": "取消",
  "common.save": "保存",
  "common.next": "下一步",
  "common.back": "返回",
  "common.loading": "加载中...",
  "common.retry": "重试"
}
```

---

## Phase 3 — Using Messages in Components

### FormattedMessage component

```tsx
// src/pages/dashboard-page.tsx
import { FormattedMessage, FormattedDate } from 'react-intl';

export function DashboardPage({ user }: { user: User }) {
  return (
    <div>
      <h1>
        <FormattedMessage id="dashboard.greeting" values={{ name: user.name }} />
      </h1>
      <p className="text-sm text-gray-600">
        <FormattedMessage
          id="dashboard.lastLogin"
          values={{
            date: (
              <FormattedDate
                value={user.lastLoginAt}
                year="numeric"
                month="long"
                day="numeric"
                hour="numeric"
                minute="numeric"
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
```

### useIntl hook for imperative use

```tsx
// src/features/transfers/components/transfer-success.tsx
import { useIntl } from 'react-intl';

export function TransferSuccess({ amount, reference }: { amount: number; reference: string }) {
  const intl = useIntl();

  // amount is in centavos — divide by 100 for display
  const formattedAmount = intl.formatNumber(amount / 100, {
    style: 'currency',
    currency: 'PHP',
  });

  return (
    <div role="status">
      <p>
        {intl.formatMessage(
          { id: 'transfer.success' },
          { amount: formattedAmount },
        )}
      </p>
      <p className="text-sm text-gray-600">
        {intl.formatMessage(
          { id: 'transfer.reference' },
          { reference },
        )}
      </p>
    </div>
  );
}
```

---

## Phase 4 — Currency and Number Formatting

### Philippine Peso formatting

```tsx
// src/lib/format.ts
// centavos → formatted peso string (matches formatPeso from B03)
export function formatPHP(centavos: number, locale: string = 'en-PH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}
```

| Locale | Output for `formatPHP(123_456_789)` (123,456,789 centavos) |
|--------|---------------------|
| `en-PH` | ₱1,234,567.89 |
| `fil-PH` | ₱1,234,567.89 |
| `zh-Hans` | ₱1,234,567.89 |

### Locale-aware amounts

```tsx
// src/components/ui/currency-display.tsx
import { useIntl } from 'react-intl';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
}

export function CurrencyDisplay({ amount, currency = 'PHP' }: CurrencyDisplayProps) {
  const intl = useIntl();

  // amount is in centavos — divide by 100 for display
  const formatted = intl.formatNumber(amount / 100, {
    style: 'currency',
    currency,
  });

  return (
    <span
      className={amount < 0 ? 'text-red-600' : 'text-green-700'}
      aria-label={`${formatted}`}
    >
      {formatted}
    </span>
  );
}
```

### Date formatting by locale

```tsx
// src/components/ui/locale-date.tsx
import { FormattedDate } from 'react-intl';

interface LocaleDateProps {
  value: string | Date;
  format?: 'short' | 'long';
}

export function LocaleDate({ value, format = 'short' }: LocaleDateProps) {
  if (format === 'short') {
    return (
      <FormattedDate value={value} year="numeric" month="short" day="numeric" />
    );
  }

  return (
    <FormattedDate
      value={value}
      year="numeric"
      month="long"
      day="numeric"
      weekday="long"
    />
  );
}
```

| Locale | Short | Long |
|--------|-------|------|
| `en-US` | Jan 15, 2026 | Thursday, January 15, 2026 |
| `fil-PH` | Ene 15, 2026 | Huwebes, Enero 15, 2026 |
| `zh-Hans` | 2026年1月15日 | 2026年1月15日星期四 |

### Checkpoint 2

Why should you use `Intl.NumberFormat` instead of manually formatting
currency strings (e.g., `"₱" + amount.toFixed(2)`)? What edge cases
does `Intl.NumberFormat` handle automatically?

Answer: `Intl.NumberFormat` handles thousands separators (which differ
by locale), decimal separators (comma vs period), currency symbol
positioning, negative number formatting, and proper rounding. Manual
formatting breaks across locales.

---

## Phase 5 — Locale Switcher

### Locale switcher component

```tsx
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
```

Place the locale switcher in the application header so it is accessible
from every page.

---

## Phase 6 — Pluralization and Complex Messages

### ICU message syntax

react-intl uses ICU MessageFormat for complex messages:

```json
{
  "accounts.count": "You have {count, plural, one {# account} other {# accounts}}.",
  "transfer.daily.limit": "You have used {used} of {limit} daily {limit, plural, one {transfer} other {transfers}}.",
  "notifications.unread": "{count, plural, =0 {No new notifications} one {# new notification} other {# new notifications}}"
}
```

### Plural rules by locale

Not all locales use plural forms the same way. ICU MessageFormat adapts automatically, but translators must know the rules:

| Locale | Plural Categories | Notes |
|--------|------------------|-------|
| `en-US` | one, other | "1 account" vs "2 accounts" |
| `fil-PH` | one, other | Similar to English |
| `zh-Hans` | other (only) | Chinese has no plural forms — use a single form: `"{count} 个账户"` |

When translating, verify plural categories for each target locale at [unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html](https://unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html).

### Select for varying terms

```json
{
  "account.type": "{type, select, savings {Savings Account} checking {Checking Account} time_deposit {Time Deposit} other {Account}}"
}
```

Usage:

```tsx
<FormattedMessage
  id="account.type"
  values={{ type: account.type }}
/>
```

---

## Key Takeaways

1. **Lazy-load locale bundles** — only download the active language.
   Code-split with dynamic `import()`.

2. **Use `Intl.NumberFormat` for all currency** — never manually format
   PHP amounts. The API handles locale differences automatically.

3. **ICU MessageFormat** for plurals, selects, and complex messages.
   Avoid string concatenation for translatable content.

4. **EWB locales**: `en-US` (primary), `fil-PH` (Filipino), `zh-Hans`
   (Simplified Chinese) — matching the EWB customer base.

5. **Persist locale choice** with Zustand + localStorage. Set
   `document.documentElement.lang` for accessibility.

---

## Exercises

### Exercise 1 — Complete Message Catalog
Add all missing message IDs for the transfer wizard (step labels,
validation errors, confirmation text) in all three locales. Verify
by switching locales while using the wizard.

### Exercise 2 — Relative Time
Use `FormattedRelativeTime` to show transaction dates as "2 hours ago",
"yesterday", "3 days ago" in the transaction list. Verify the output
in Filipino and Chinese.

### Exercise 3 — Number Input Locale
Build a currency input that accepts locale-specific number formatting.
In `en-US`, the user types `1,234.56`. In some locales, they might type
`1.234,56`. Parse both correctly into a numeric value.

---

## What Comes Next

**Next guide:** [B09 — Integration Capstone](B09_integration-capstone.md) —
where you build a complete Bill Payment feature that integrates every
concept from Levels 1–8.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
