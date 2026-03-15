// Exercise tests for Level 1 — Welcome
// Tests: Currency Formatter, Banking Domain Types, Compliance Checklist
//
// Run: npm run test:exercises -- level-01

import { describe, it, expect } from 'vitest';

// ─── Exercise 1: Currency Formatter ──────────────────────────────────────────

describe('Exercise 1: Currency Formatter', () => {
  // Students create: src/lib/currency.ts
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let currency: typeof import('@/lib/currency');

  beforeAll(async () => {
    try {
      currency = await import('@/lib/currency');
    } catch {
      // File doesn't exist yet — tests will fail with helpful message
    }
  });

  describe('formatPHP', () => {
    it('formats 150000 as ₱150,000.00', () => {
      expect(currency?.formatPHP).toBeDefined();
      expect(currency.formatPHP(150000)).toBe('₱150,000.00');
    });

    it('formats 0 as ₱0.00', () => {
      expect(currency.formatPHP(0)).toBe('₱0.00');
    });

    it('formats 42500.5 as ₱42,500.50', () => {
      expect(currency.formatPHP(42500.5)).toBe('₱42,500.50');
    });
  });

  describe('formatCurrency', () => {
    it('formats 1000 USD as $1,000.00', () => {
      expect(currency?.formatCurrency).toBeDefined();
      expect(currency.formatCurrency(1000, 'USD')).toBe('$1,000.00');
    });
  });

  describe('parseCurrencyInput', () => {
    it('parses ₱1,500.00 to 1500', () => {
      expect(currency?.parseCurrencyInput).toBeDefined();
      expect(currency.parseCurrencyInput('₱1,500.00')).toBe(1500);
    });

    it('parses plain 1500 to 1500', () => {
      expect(currency.parseCurrencyInput('1500')).toBe(1500);
    });

    it('returns null for invalid input', () => {
      expect(currency.parseCurrencyInput('abc')).toBeNull();
    });
  });
});

// ─── Exercise 2: Banking Domain Types ────────────────────────────────────────

describe('Exercise 2: Banking Domain Types', () => {
  // Students create: src/types/account.ts and src/schemas/account.ts
  // Type checking is validated by tsc, but we can test the Zod schema

  it('account schema exists and exports AccountSchema', async () => {
    const mod = await import('@/schemas/account');
    expect(mod.AccountSchema || mod.accountSchema).toBeDefined();
  });

  it('validates a well-formed account', async () => {
    const mod = await import('@/schemas/account');
    const schema = mod.AccountSchema || mod.accountSchema;

    const validAccount = {
      id: 'acc-001',
      accountNumber: '1234567890',
      accountName: 'Mark Paul Savings',
      type: 'savings',
      balance: 15_000_000, // centavos
      availableBalance: 14_500_000,
      currency: 'PHP',
      status: 'active',
      openedDate: '2024-01-15T00:00:00Z',
      lastActivityDate: '2026-03-14T00:00:00Z',
    };

    const result = schema.safeParse(validAccount);
    expect(result.success).toBe(true);
  });

  it('rejects an account where availableBalance > balance', async () => {
    const mod = await import('@/schemas/account');
    const schema = mod.AccountSchema || mod.accountSchema;

    const invalid = {
      id: 'acc-001',
      accountNumber: '1234567890',
      accountName: 'Test',
      type: 'savings',
      balance: 10_000_000,
      availableBalance: 20_000_000, // more than balance
      currency: 'PHP',
      status: 'active',
      openedDate: '2024-01-15T00:00:00Z',
      lastActivityDate: '2026-03-14T00:00:00Z',
    };

    const result = schema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects a 9-digit account number', async () => {
    const mod = await import('@/schemas/account');
    const schema = mod.AccountSchema || mod.accountSchema;

    const invalid = {
      id: 'acc-001',
      accountNumber: '123456789', // only 9 digits
      accountName: 'Test',
      type: 'savings',
      balance: 10_000_000,
      availableBalance: 10_000_000,
      currency: 'PHP',
      status: 'active',
      openedDate: '2024-01-15T00:00:00Z',
      lastActivityDate: '2026-03-14T00:00:00Z',
    };

    const result = schema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ─── Exercise 3: Compliance Checklist ────────────────────────────────────────

describe('Exercise 3: Compliance Checklist', () => {
  // Students create: src/types/compliance.ts

  it('getRegulationForArea returns correct regulations', async () => {
    const mod = await import('@/types/compliance');
    expect(mod.getRegulationForArea).toBeDefined();

    expect(mod.getRegulationForArea('data-masking')).toMatch(/DPA|RA 10173/i);
    expect(mod.getRegulationForArea('authentication')).toMatch(/BSP.*982|1213/i);
  });

  it('summarizeChecklist correctly counts statuses', async () => {
    const mod = await import('@/types/compliance');
    expect(mod.summarizeChecklist).toBeDefined();

    const checks = [
      { status: 'passed' as const, area: 'data-masking' as const, verifiedBy: 'Mark', verifiedAt: '2026-03-14' },
      { status: 'failed' as const, area: 'authentication' as const, reason: 'Weak MFA', regulation: 'BSP 982' },
      { status: 'not-started' as const, area: 'accessibility' as const },
      { status: 'in-progress' as const, area: 'error-monitoring' as const, assignee: 'Dev Team' },
    ];

    const summary = mod.summarizeChecklist(checks);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.pending).toBe(2);
  });
});
