// Exercise tests for Level 4 — State & Routing
// Tests: Transaction Filter Store, Route Configuration, Testing Hooks
//
// Run: npm run test:exercises -- level-04

import { describe, it, expect, beforeEach } from 'vitest';

// ─── Exercise 1: Transaction Filter Store ────────────────────────────────────

describe('Exercise 1: Transaction Filter Store', () => {
  // Students create: src/features/accounts/stores/transaction-filter-store.ts

  beforeEach(async () => {
    // Reset store state between tests
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;
    store.setState({
      transactionType: 'all',
      dateRange: { start: null, end: null },
      sortOrder: 'newest',
    });
  });

  it('has correct default state', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const state = mod.useTransactionFilterStore.getState();

    expect(state.transactionType).toBe('all');
    expect(state.dateRange).toEqual({ start: null, end: null });
    expect(state.sortOrder).toBe('newest');
  });

  it('setTransactionType updates the filter', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;

    store.getState().setTransactionType('credit');
    expect(store.getState().transactionType).toBe('credit');
  });

  it('setSortOrder updates the sort', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;

    store.getState().setSortOrder('amount-high');
    expect(store.getState().sortOrder).toBe('amount-high');
  });

  it('setDateRange updates the range', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;

    store.getState().setDateRange({ start: '2026-03-01', end: '2026-03-14' });
    expect(store.getState().dateRange).toEqual({ start: '2026-03-01', end: '2026-03-14' });
  });

  it('resetFilters returns to defaults', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;

    store.getState().setTransactionType('debit');
    store.getState().setSortOrder('oldest');
    store.getState().resetFilters();

    const state = store.getState();
    expect(state.transactionType).toBe('all');
    expect(state.sortOrder).toBe('newest');
  });

  it('hasActiveFilters returns false with defaults', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;

    expect(store.getState().hasActiveFilters()).toBe(false);
  });

  it('hasActiveFilters returns true when filter is active', async () => {
    const mod = await import('@/features/accounts/stores/transaction-filter-store');
    const store = mod.useTransactionFilterStore;

    store.getState().setTransactionType('credit');
    expect(store.getState().hasActiveFilters()).toBe(true);
  });
});
