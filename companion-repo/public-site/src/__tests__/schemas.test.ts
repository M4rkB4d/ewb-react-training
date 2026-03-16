// Tests for Zod schemas used in the public-site
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Product Schema', () => {
  // Mirror the schema from app/products/page.tsx
  const ProductSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    summary: z.string(),
    category: z.enum(['savings', 'loans', 'credit-cards', 'investments']),
    interestRate: z.number().nonnegative().optional(),
  });

  it('validates a savings product', () => {
    const result = ProductSchema.safeParse({
      id: 'prod-001',
      slug: 'premium-savings',
      name: 'Premium Savings',
      summary: 'High-yield savings account',
      category: 'savings',
      interestRate: 4.5,
    });

    expect(result.success).toBe(true);
  });

  it('allows optional interestRate', () => {
    const result = ProductSchema.safeParse({
      id: 'prod-002',
      slug: 'credit-gold',
      name: 'Gold Credit Card',
      summary: 'Premium credit card',
      category: 'credit-cards',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = ProductSchema.safeParse({
      id: 'prod-003',
      slug: 'test',
      name: 'Test',
      summary: 'Test',
      category: 'invalid-category',
    });

    expect(result.success).toBe(false);
  });

  it('rejects negative interest rate', () => {
    const result = ProductSchema.safeParse({
      id: 'prod-004',
      slug: 'test',
      name: 'Test',
      summary: 'Test',
      category: 'savings',
      interestRate: -1.5,
    });

    expect(result.success).toBe(false);
  });
});

describe('Rate Alert Schema', () => {
  // Must match app/api/rate-alerts/route.ts
  const RateAlertSchema = z.object({
    email: z.string().email(),
    currency: z.string().length(3),
    targetRate: z.number().positive(),
    direction: z.enum(['above', 'below']),
  });

  it('validates a rate alert subscription', () => {
    const result = RateAlertSchema.safeParse({
      email: 'user@example.com',
      currency: 'USD',
      targetRate: 56.50,
      direction: 'above',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = RateAlertSchema.safeParse({
      email: 'not-an-email',
      currency: 'USD',
      targetRate: 56.50,
      direction: 'above',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid direction', () => {
    const result = RateAlertSchema.safeParse({
      email: 'user@example.com',
      currency: 'USD',
      targetRate: 56.50,
      direction: 'sideways',
    });

    expect(result.success).toBe(false);
  });
});
