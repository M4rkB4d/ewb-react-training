// Exercise tests for Level 7 — Production
// Tests: PII Masking, Input Sanitization, Role Permissions, Audit Logging
//
// Run: npm run test:exercises -- level-07

import { describe, it, expect } from 'vitest';

// ─── Exercise 1: PII Masking Utilities ───────────────────────────────────────

describe('Exercise 1: PII Masking', () => {
  // Students create: src/lib/masking.ts

  it('exports maskAccountNumber', async () => {
    const mod = await import('@/lib/masking');
    expect(mod.maskAccountNumber).toBeDefined();
  });

  it('masks account number showing last 4 digits', async () => {
    const mod = await import('@/lib/masking');
    const masked = mod.maskAccountNumber('1234567890');
    expect(masked).toMatch(/\*+7890/);
    expect(masked).not.toContain('123456');
  });

  it('exports maskEmail', async () => {
    const mod = await import('@/lib/masking');
    expect(mod.maskEmail).toBeDefined();
  });

  it('masks email preserving domain', async () => {
    const mod = await import('@/lib/masking');
    const masked = mod.maskEmail('mark.paul@eastwestbanker.com');
    expect(masked).toContain('@eastwestbanker.com');
    expect(masked).not.toContain('mark.paul');
  });

  it('exports maskPhone', async () => {
    const mod = await import('@/lib/masking');
    expect(mod.maskPhone).toBeDefined();
  });

  it('masks phone showing last 4 digits', async () => {
    const mod = await import('@/lib/masking');
    const masked = mod.maskPhone('+639171234567');
    expect(masked).toMatch(/4567/);
    expect(masked).not.toContain('917123');
  });
});

// ─── Exercise 2: Input Sanitization ──────────────────────────────────────────

describe('Exercise 2: Sanitization', () => {
  // Students create: src/lib/sanitize.ts

  it('exports sanitizeHtml', async () => {
    const mod = await import('@/lib/sanitize');
    expect(mod.sanitizeHtml || mod.sanitize).toBeDefined();
  });

  it('strips script tags', async () => {
    const mod = await import('@/lib/sanitize');
    const fn = mod.sanitizeHtml || mod.sanitize;
    const result = fn('<script>alert("xss")</script>Hello');
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('strips event handlers', async () => {
    const mod = await import('@/lib/sanitize');
    const fn = mod.sanitizeHtml || mod.sanitize;
    const result = fn('<div onmouseover="alert(1)">Content</div>');
    expect(result).not.toContain('onmouseover');
    expect(result).toContain('Content');
  });
});

// ─── Exercise 3: Role-Based Permissions ──────────────────────────────────────

describe('Exercise 3: Permissions', () => {
  // Students create: src/lib/permissions.ts

  it('exports hasPermission function', async () => {
    const mod = await import('@/lib/permissions');
    expect(mod.hasPermission).toBeDefined();
  });

  it('admin has all permissions', async () => {
    const mod = await import('@/lib/permissions');
    expect(mod.hasPermission('admin', 'accounts:read')).toBe(true);
    expect(mod.hasPermission('admin', 'accounts:write')).toBe(true);
    expect(mod.hasPermission('admin', 'users:manage')).toBe(true);
  });

  it('viewer has read-only access', async () => {
    const mod = await import('@/lib/permissions');
    expect(mod.hasPermission('viewer', 'accounts:read')).toBe(true);
    expect(mod.hasPermission('viewer', 'accounts:write')).toBe(false);
  });
});
