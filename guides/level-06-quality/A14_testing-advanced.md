# A14 — Testing Advanced

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 6 — Quality

---

## What You Will Learn

By the end of this guide, you will:

- Write end-to-end tests with Playwright
- Build test data factories for consistent test data
- Test complete user flows (login → transfer → verify)
- Achieve meaningful test coverage without chasing percentages
- Organize tests by type (unit, integration, E2E)
- Handle flaky tests and test isolation
- Build a CI-friendly test pipeline

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A10 — Testing Components and Hooks | Level 4 |
| Completed B04 — Authentication Part 2 | Level 5 |
| Playwright installed | `npm install -D @playwright/test` |

---

## Phase 1 — Test Strategy

### The testing pyramid for banking apps

```
         ╱╲
        ╱  ╲         E2E (Playwright)
       ╱ 10 ╲        Critical user flows
      ╱──────╲
     ╱        ╲       Integration
    ╱    30    ╲      Component + API + state
   ╱────────────╲
  ╱              ╲     Unit
 ╱      60       ╲    Hooks, utils, stores
╱────────────────────╲
```

| Type | Tool | Speed | What It Tests | Count |
|------|------|-------|---------------|-------|
| **Unit** | Vitest | Fast (ms) | Individual functions, hooks, stores | ~60% |
| **Integration** | Vitest + RTL + MSW | Medium (ms-s) | Components with API/state | ~30% |
| **E2E** | Playwright | Slow (s) | Full user flows in real browser | ~10% |

### What to test in a banking app

| Priority | What | Why |
|----------|------|-----|
| **Critical** | Login flow, transfers, balance display | Financial accuracy |
| **High** | Form validation, error states, session timeout | User safety |
| **Medium** | Navigation, search, filtering | User experience |
| **Low** | Animations, hover states, tooltips | Polish |

### Checkpoint 1

Should you aim for 100% code coverage? Why or why not? What coverage percentage
is a reasonable target for a banking application?

---

## Phase 2 — Test Data Factories

### Factory pattern

```tsx
// src/test/factories/user-factory.ts
import type { User } from '@/types/auth';

let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `user-${idCounter}`;
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: nextId(),
    name: 'Juan Santos',
    email: 'juan.santos@ewb.com',
    role: 'customer',
    ...overrides,
  };
}

export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({ role: 'admin', name: 'Admin User', ...overrides });
}

export function createTeller(overrides: Partial<User> = {}): User {
  return createUser({ role: 'teller', name: 'Maria Cruz', ...overrides });
}

// Call in beforeEach to ensure deterministic IDs across tests
export function resetFactories(): void {
  idCounter = 0;
}
```

```tsx
// src/test/factories/account-factory.ts
import type { Account } from '@/features/accounts/types';

let accountCounter = 0;

function nextAccountId(): string {
  accountCounter += 1;
  return `acc-${accountCounter}`;
}

export function createAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: nextAccountId(),
    name: 'Personal Savings',
    number: `${1000000000 + accountCounter}`,
    type: 'savings',
    balance: 15_000_000, // centavos — ₱150,000.00
    currency: 'PHP',
    isActive: true,
    ...overrides,
  };
}

export function createCheckingAccount(overrides: Partial<Account> = {}): Account {
  return createAccount({ type: 'checking', name: 'Payroll Checking', ...overrides });
}
```

```tsx
// src/test/factories/transaction-factory.ts
import type { Transaction } from '@/features/accounts/types';

let txnCounter = 0;

export function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  txnCounter += 1;
  return {
    id: `txn-${txnCounter}`,
    date: new Date().toISOString(),
    description: 'POS Purchase — SM Megamall',
    amount: -250_000, // centavos — ₱2,500.00
    type: 'debit',
    balance: 14_750_000, // centavos — ₱147,500.00
    reference: `REF-${txnCounter.toString().padStart(4, '0')}`,
    channel: 'POS',
    ...overrides,
  };
}

export function createTransactions(count: number, startBalance = 15_000_000): Transaction[] {
  let runningBalance = startBalance;
  return Array.from({ length: count }, (_, i) => {
    const amount = -((i + 1) * 50_000); // Deterministic: ₱500, ₱1,000, ₱1,500...
    runningBalance += amount;
    return createTransaction({
      amount,
      balance: runningBalance,
      description: `Transaction ${i + 1}`,
    });
  });
}
```

### Using factories in tests

```tsx
import { createUser } from '@/test/factories/user-factory';
import { createAccount } from '@/test/factories/account-factory';

it('shows the correct greeting', () => {
  const user = createUser({ name: 'Maria Santos' });
  render(<Dashboard user={user} />);
  expect(screen.getByText('Welcome, Maria Santos')).toBeInTheDocument();
});

it('displays account balance', () => {
  const account = createAccount({ balance: 5_000_000 }); // centavos — ₱50,000.00
  render(<AccountCard {...account} />);
  expect(screen.getByText('₱50,000.00')).toBeInTheDocument(); // formatPHP(5_000_000) → ₱50,000.00
});
```

---

## Phase 3 — Playwright E2E Tests

### Playwright configuration

```tsx
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Login flow E2E test

```tsx
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Username').fill('juan.santos');
    await page.getByLabel('Password').fill('SecureP@ss123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Welcome, Juan Santos')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Username').fill('wrong');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('alert')).toContainText('Invalid username or password');
    await expect(page).toHaveURL('/login');
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });
});
```

### Transfer flow E2E test

```tsx
// e2e/transfers/transfer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fund Transfer', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (or use auth state fixture)
    await page.goto('/login');
    await page.getByLabel('Username').fill('juan.santos');
    await page.getByLabel('Password').fill('SecureP@ss123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');
  });

  test('completes a fund transfer', async ({ page }) => {
    await page.goto('/transfers');

    // Step 1 — Select accounts
    await page.getByLabel('From Account').selectOption('acc-1');
    await page.getByLabel('To Account').selectOption('acc-2');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2 — Enter amount
    await page.getByLabel('Amount').fill('5000');
    await page.getByLabel('Notes').fill('Monthly rent');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3 — Review and confirm
    await expect(page.getByText('₱5,000.00')).toBeVisible();
    await expect(page.getByText('Monthly rent')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Transfer' }).click();

    // Success
    await expect(page.getByText('Transfer completed')).toBeVisible();
    await expect(page.getByText(/REF-/)).toBeVisible();
  });
});
```

### Auth state fixture

```tsx
// e2e/fixtures/auth.ts
import { test as base, type Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('juan.santos');
    await page.getByLabel('Password').fill('SecureP@ss123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');
    await use(page);
  },
});
```

### Checkpoint 2

E2E tests are slower and more fragile than unit tests. When is an E2E test
the right choice over a unit or integration test?

---

## Phase 4 — Test Organization

### File structure

```
src/
├── features/
│   └── accounts/
│       ├── components/
│       │   ├── account-card.tsx
│       │   └── account-card.test.tsx      ← Unit/integration
│       ├── hooks/
│       │   ├── use-accounts.ts
│       │   └── use-accounts.test.ts       ← Integration
│       └── api/
│           ├── accounts-api.ts
│           └── accounts-api.test.ts       ← Unit
├── test/
│   ├── factories/                          ← Shared test data
│   ├── mocks/                              ← MSW handlers
│   └── test-utils.tsx                      ← Custom render
e2e/
├── auth/
│   └── login.spec.ts                       ← E2E
├── transfers/
│   └── transfer.spec.ts                    ← E2E
└── fixtures/
    └── auth.ts                             ← Shared E2E setup
```

### Test commands

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test"
  }
}
```

---

## Phase 5 — Handling Flaky Tests

### Common causes and fixes

| Cause | Fix |
|-------|-----|
| Timing issues | Use `waitFor`, `findBy*` queries, Playwright auto-waiting |
| Shared state between tests | Reset stores in `beforeEach`, fresh QueryClient per test |
| Network timing | MSW handles requests synchronously in tests |
| Animation timing | Disable animations in test environment |
| Date/time dependent | Use `vi.useFakeTimers()` |

### Test isolation checklist

```tsx
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

The `onUnhandledRequest: 'error'` option catches any API call that does not
have a matching MSW handler — this prevents tests from accidentally hitting
real APIs.

### Testing pure utility functions

Pure functions (no side effects, no dependencies) are the easiest to test.
The `formatPHP` utility from B03 is a good example:

```tsx
// src/lib/format.test.ts
import { formatPHP } from './format';

describe('formatPHP', () => {
  it('formats centavos as PHP currency', () => {
    const result = formatPHP(150_000); // 150000 centavos = ₱1,500.00
    expect(result).toContain('1,500.00');
  });

  it('formats zero', () => {
    expect(formatPHP(0)).toContain('0.00');
  });

  it('formats large amounts', () => {
    expect(formatPHP(5_000_000)).toContain('50,000.00');
  });

  it('handles negative amounts', () => {
    expect(formatPHP(-50_000)).toMatch(/-.*500\.00/);
  });
});
```

Notice the test uses `.toContain()` and `.toMatch()` instead of exact string
equality. This is intentional — the exact output depends on the runtime's
`Intl.NumberFormat` implementation, which varies slightly between Node.js
versions and browsers (e.g., `₱1,500.00` vs `PHP 1,500.00`). Testing the
numeric content rather than the exact string makes the test resilient across
environments.

---

## Key Takeaways

1. **Test pyramid**: 60% unit, 30% integration, 10% E2E. More unit tests
   because they are fast and reliable. Fewer E2E tests for critical flows.

2. **Factories** create consistent test data. Never hardcode test data in
   individual tests — use factories with overrides.

3. **Playwright** for E2E tests. Test real user flows: login, transfer,
   error handling. Use auth fixtures to avoid repeating login in every test.

4. **Meaningful coverage** over 100% coverage. Test what matters: financial
   calculations, auth flows, error states. Skip testing trivial rendering.

5. **Prevent flaky tests** with proper isolation: reset stores, fresh
   QueryClient, MSW handler reset, deterministic timers.

---

## Exercises

### Exercise 1 — Session Timeout E2E
Write a Playwright test that verifies the session timeout warning appears after
the configured idle period. Use `page.clock` to control time.

### Exercise 2 — Accessibility E2E
Write Playwright tests that verify keyboard navigation through the transfer
wizard — tab through all inputs, use arrow keys for select, submit with Enter.

### Exercise 3 — Visual Regression
Set up Playwright visual regression tests for the login page and dashboard.
Compare screenshots across runs to catch unintended UI changes.

> **Hint:** Playwright has built-in screenshot comparison. Use
> `toHaveScreenshot()` — it saves a baseline on the first run, then
> compares against it on subsequent runs:
>
> ```ts
> import { test, expect } from '@playwright/test';
>
> test('login page visual', async ({ page }) => {
>   await page.goto('/login');
>   await expect(page).toHaveScreenshot('login.png', {
>     maxDiffPixelRatio: 0.01, // Allow 1% pixel difference
>   });
> });
> ```
>
> Run `npx playwright test --update-snapshots` to regenerate baselines
> after intentional UI changes.

---

## What Comes Next

**Next guide:** [B06 — Monitoring and Observability](B06_monitoring-and-observability.md) —
where you integrate Sentry for error tracking, Azure Application Insights for
telemetry, and structured logging for BSP compliance.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
