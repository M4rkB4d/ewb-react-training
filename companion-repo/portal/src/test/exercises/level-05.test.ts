// Exercise tests for Level 5 — Data & Auth
// Tests: API Client, Login Flow, TanStack Query Hooks
//
// Run: npm run test:exercises -- level-05

import { describe, it, expect } from 'vitest';

// ─── Exercise 1: Secure API Client ──────────────────────────────────────────

describe('Exercise 1: API Client', () => {
  // Students create/modify: src/lib/api-client.ts

  it('exports an apiClient axios instance', async () => {
    const mod = await import('@/lib/api-client');
    expect(mod.apiClient).toBeDefined();
    expect(mod.apiClient.defaults.withCredentials).toBe(true);
  });

  it('has a 30-second timeout', async () => {
    const mod = await import('@/lib/api-client');
    expect(mod.apiClient.defaults.timeout).toBe(30_000);
  });

  it('has baseURL from env config', async () => {
    const mod = await import('@/lib/api-client');
    expect(mod.apiClient.defaults.baseURL).toBeDefined();
    expect(typeof mod.apiClient.defaults.baseURL).toBe('string');
  });

  it('has request interceptors configured', async () => {
    const mod = await import('@/lib/api-client');
    // Axios stores interceptors internally
    const reqInterceptors = (mod.apiClient.interceptors.request as { handlers: unknown[] }).handlers;
    expect(reqInterceptors.length).toBeGreaterThan(0);
  });

  it('has response interceptors configured', async () => {
    const mod = await import('@/lib/api-client');
    const resInterceptors = (mod.apiClient.interceptors.response as { handlers: unknown[] }).handlers;
    expect(resInterceptors.length).toBeGreaterThan(0);
  });
});

// ─── Exercise 2: Auth Store ─────────────────────────────────────────────────

describe('Exercise 2: Auth Store', () => {
  // Students create: src/stores/auth-store.ts

  it('exports useAuthStore', async () => {
    const mod = await import('@/stores/auth-store');
    expect(mod.useAuthStore).toBeDefined();
  });

  it('has initial status of idle', async () => {
    const mod = await import('@/stores/auth-store');
    const state = mod.useAuthStore.getState();
    expect(['idle', 'loading', 'unauthenticated']).toContain(state.status);
  });

  it('has login and logout actions', async () => {
    const mod = await import('@/stores/auth-store');
    const state = mod.useAuthStore.getState();
    expect(typeof state.login === 'function' || typeof state.setToken === 'function' || typeof state.setAuth === 'function').toBe(true);
    expect(typeof state.logout === 'function' || typeof state.clearAuth === 'function').toBe(true);
  });
});

// ─── Exercise 3: Account Query Hook ─────────────────────────────────────────

describe('Exercise 3: Account Query Hook', () => {
  // Students create: src/features/accounts/hooks/use-accounts.ts

  it('exports useAccounts hook', async () => {
    const mod = await import('@/features/accounts/hooks/use-accounts');
    expect(mod.useAccounts || mod.default).toBeDefined();
  });

  it('exports account API functions', async () => {
    const mod = await import('@/features/accounts/api/accounts-api');
    expect(mod.fetchAccounts || mod.getAccounts).toBeDefined();
  });

  it('uses proper query keys', async () => {
    const mod = await import('@/features/accounts/api/query-keys');
    expect(mod.accountKeys || mod.queryKeys).toBeDefined();
  });
});
