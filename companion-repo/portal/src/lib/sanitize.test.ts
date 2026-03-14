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
  it('converts pesos to centavos', () => {
    // User enters ₱1,000 → schema returns 100000 centavos
    expect(amountSchema.parse(1000)).toBe(100_000);
  });

  it('rounds fractional centavos to nearest integer', () => {
    // ₱99.999 → 9999.9 → rounds to 10000 centavos
    expect(amountSchema.parse(99.999)).toBe(10_000);
    // ₱50.555 → 5055.5 → rounds to 5056 centavos
    expect(amountSchema.parse(50.555)).toBe(5056);
  });

  it('rejects zero and negative amounts', () => {
    expect(() => amountSchema.parse(0)).toThrow();
    expect(() => amountSchema.parse(-100)).toThrow();
  });

  it('rejects amounts over ₱1,000,000', () => {
    expect(() => amountSchema.parse(1_000_001)).toThrow();
  });
});
