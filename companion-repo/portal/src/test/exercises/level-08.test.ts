// Exercise tests for Level 8 — Mastery
// Tests: i18n, CurrencyInput, Transfer Wizard, Real-time Hooks
//
// Run: npm run test:exercises -- level-08

import { describe, it, expect } from 'vitest';

// ─── Exercise 1: i18n Message Catalogs ───────────────────────────────────────

describe('Exercise 1: i18n Messages', () => {
  // Students create: src/i18n/messages/en-US.json, fil-PH.json, zh-Hans.json

  it('English messages exist with required keys', async () => {
    const messages = await import('@/i18n/messages/en-US.json');
    expect(messages.default || messages).toBeDefined();

    const msgs = messages.default || messages;
    // Should have common UI strings
    expect(msgs['app.title'] || msgs['common.appTitle']).toBeDefined();
  });

  it('Filipino messages exist', async () => {
    const messages = await import('@/i18n/messages/fil-PH.json');
    expect(messages.default || messages).toBeDefined();
  });

  it('Chinese messages exist', async () => {
    const messages = await import('@/i18n/messages/zh-Hans.json');
    expect(messages.default || messages).toBeDefined();
  });

  it('all locales have the same message keys', async () => {
    const en = await import('@/i18n/messages/en-US.json');
    const fil = await import('@/i18n/messages/fil-PH.json');
    const zh = await import('@/i18n/messages/zh-Hans.json');

    const enKeys = Object.keys(en.default || en).sort();
    const filKeys = Object.keys(fil.default || fil).sort();
    const zhKeys = Object.keys(zh.default || zh).sort();

    expect(filKeys).toEqual(enKeys);
    expect(zhKeys).toEqual(enKeys);
  });
});

// ─── Exercise 2: Locale Store ────────────────────────────────────────────────

describe('Exercise 2: Locale Store', () => {
  // Students create: src/stores/locale-store.ts

  it('exports useLocaleStore', async () => {
    const mod = await import('@/stores/locale-store');
    expect(mod.useLocaleStore).toBeDefined();
  });

  it('defaults to en-US', async () => {
    const mod = await import('@/stores/locale-store');
    const state = mod.useLocaleStore.getState();
    expect(state.locale).toBe('en-US');
  });

  it('can change locale', async () => {
    const mod = await import('@/stores/locale-store');
    const store = mod.useLocaleStore;

    store.getState().setLocale('fil-PH');
    expect(store.getState().locale).toBe('fil-PH');

    // Reset
    store.getState().setLocale('en-US');
  });
});

// ─── Exercise 3: Real-time Hooks ─────────────────────────────────────────────

describe('Exercise 3: Real-time Hooks', () => {
  // Students create: src/hooks/use-websocket.ts, use-event-source.ts, use-polling.ts

  it('exports useWebSocket hook', async () => {
    const mod = await import('@/hooks/use-websocket');
    expect(mod.useWebSocket || mod.default).toBeDefined();
  });

  it('exports useEventSource hook', async () => {
    const mod = await import('@/hooks/use-event-source');
    expect(mod.useEventSource || mod.default).toBeDefined();
  });

  it('exports usePolling hook', async () => {
    const mod = await import('@/hooks/use-polling');
    expect(mod.usePolling || mod.default).toBeDefined();
  });
});

// ─── Exercise 4: Payment API Schema ─────────────────────────────────────────

describe('Exercise 4: Payment API', () => {
  // Students create: src/features/payments/api/payment-api.ts

  it('exports payment API functions', async () => {
    const mod = await import('@/features/payments/api/payment-api');
    expect(mod.PaymentSchema || mod.paymentSchema).toBeDefined();
  });

  it('validates payment with centavo amounts', async () => {
    const mod = await import('@/features/payments/api/payment-api');
    const schema = mod.PaymentSchema || mod.paymentSchema;

    const valid = {
      id: 'pay-001',
      reference: 'REF-20260315-001',
      billerId: 'biller-001',
      billerName: 'Meralco',
      accountId: 'acc-001',
      amount: 250_000, // ₱2,500.00 in centavos
      fee: 1_500,       // ₱15.00 in centavos
      total: 251_500,
      status: 'completed',
      paidAt: '2026-03-15T10:30:00Z',
    };

    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
