import { usernameSchema, searchQuerySchema, amountSchema } from './sanitize';

describe('usernameSchema', () => {
  it('accepts valid usernames', () => {
    expect(usernameSchema.parse('juan.santos')).toBe('juan.santos');
    expect(usernameSchema.parse('user_123')).toBe('user_123');
    expect(usernameSchema.parse('admin-01')).toBe('admin-01');
  });

  it('rejects usernames shorter than 3 characters', () => {
    expect(() => usernameSchema.parse('ab')).toThrow();
  });

  it('rejects usernames with special characters', () => {
    expect(() => usernameSchema.parse('user@name')).toThrow();
    expect(() => usernameSchema.parse('user name')).toThrow();
    expect(() => usernameSchema.parse('<script>')).toThrow();
  });
});

describe('searchQuerySchema', () => {
  it('trims whitespace', () => {
    expect(searchQuerySchema.parse('  hello  ')).toBe('hello');
  });

  it('rejects strings longer than 200 characters', () => {
    expect(() => searchQuerySchema.parse('a'.repeat(201))).toThrow();
  });

  it('accepts empty string', () => {
    expect(searchQuerySchema.parse('')).toBe('');
  });
});

describe('amountSchema', () => {
  it('accepts valid centavo amounts', () => {
    // Input is already in centavos — ₱1,000.00 = 100000 centavos
    expect(amountSchema.parse(100_000)).toBe(100_000);
    expect(amountSchema.parse(1)).toBe(1); // ₱0.01
    expect(amountSchema.parse(100_000_000)).toBe(100_000_000); // ₱1,000,000.00 (max)
  });

  it('rejects non-integer centavo values', () => {
    // Centavos must be integers — no fractional centavos
    expect(() => amountSchema.parse(99.5)).toThrow();
    expect(() => amountSchema.parse(50.555)).toThrow();
  });

  it('rejects zero and negative amounts', () => {
    expect(() => amountSchema.parse(0)).toThrow();
    expect(() => amountSchema.parse(-100)).toThrow();
  });

  it('rejects amounts over ₱1,000,000 (100,000,000 centavos)', () => {
    expect(() => amountSchema.parse(100_000_001)).toThrow();
  });
});
