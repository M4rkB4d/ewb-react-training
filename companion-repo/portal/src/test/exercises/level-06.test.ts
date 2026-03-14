// Exercise tests for Level 6 — Quality
// Tests: Error Hierarchy, Error Boundary, Web Vitals, MSW Setup
//
// Run: npm run test:exercises -- level-06

import { describe, it, expect } from 'vitest';

// ─── Exercise 1: Structured Error Hierarchy ──────────────────────────────────

describe('Exercise 1: Error Hierarchy', () => {
  // Students create: src/lib/errors.ts

  it('exports AppError base class', async () => {
    const mod = await import('@/lib/errors');
    expect(mod.AppError).toBeDefined();
  });

  it('AppError has code and statusCode', async () => {
    const mod = await import('@/lib/errors');
    const err = new mod.AppError('test', 'TEST_ERROR', 500);
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_ERROR');
    expect(err.statusCode).toBe(500);
    expect(err instanceof Error).toBe(true);
  });

  it('exports NetworkError', async () => {
    const mod = await import('@/lib/errors');
    expect(mod.NetworkError).toBeDefined();
    const err = new mod.NetworkError('Connection failed');
    expect(err instanceof mod.AppError).toBe(true);
  });

  it('exports AuthenticationError', async () => {
    const mod = await import('@/lib/errors');
    expect(mod.AuthenticationError).toBeDefined();
    const err = new mod.AuthenticationError('Session expired');
    expect(err.statusCode).toBe(401);
  });

  it('exports ValidationError', async () => {
    const mod = await import('@/lib/errors');
    expect(mod.ValidationError).toBeDefined();
  });

  it('exports isAppError type guard', async () => {
    const mod = await import('@/lib/errors');
    expect(mod.isAppError).toBeDefined();
    expect(mod.isAppError(new mod.AppError('test', 'TEST', 500))).toBe(true);
    expect(mod.isAppError(new Error('test'))).toBe(false);
  });
});

// ─── Exercise 2: MSW Mock Setup ─────────────────────────────────────────────

describe('Exercise 2: MSW Handlers', () => {
  // Students create: src/test/mocks/handlers.ts and src/test/mocks/server.ts

  it('exports MSW handlers array', async () => {
    const mod = await import('@/test/mocks/handlers');
    expect(mod.handlers).toBeDefined();
    expect(Array.isArray(mod.handlers)).toBe(true);
  });

  it('exports MSW server', async () => {
    const mod = await import('@/test/mocks/server');
    expect(mod.server).toBeDefined();
    expect(typeof mod.server.listen).toBe('function');
    expect(typeof mod.server.close).toBe('function');
  });
});

// ─── Exercise 3: Test Factories ──────────────────────────────────────────────

describe('Exercise 3: Test Factories', () => {
  // Students create: src/test/factories/

  it('exports createUser factory', async () => {
    const mod = await import('@/test/factories/user-factory');
    expect(mod.createUser).toBeDefined();

    const user = mod.createUser();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
  });

  it('createUser accepts overrides', async () => {
    const mod = await import('@/test/factories/user-factory');
    const user = mod.createUser({ email: 'custom@ewb.com' });
    expect(user.email).toBe('custom@ewb.com');
  });

  it('exports createAccount factory', async () => {
    const mod = await import('@/test/factories/account-factory');
    expect(mod.createAccount).toBeDefined();

    const account = mod.createAccount();
    expect(account.id).toBeDefined();
    expect(account.balance).toBeGreaterThanOrEqual(0);
  });
});
