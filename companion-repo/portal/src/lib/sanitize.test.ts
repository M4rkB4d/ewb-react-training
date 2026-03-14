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
  it('accepts valid amounts', () => {
    expect(amountSchema.parse(1000)).toBe(1000);
  });

  it('rounds to centavos', () => {
    expect(amountSchema.parse(99.999)).toBe(100);
    expect(amountSchema.parse(50.555)).toBe(50.56);
  });

  it('rejects zero and negative amounts', () => {
    expect(() => amountSchema.parse(0)).toThrow();
    expect(() => amountSchema.parse(-100)).toThrow();
  });

  it('rejects amounts over 1,000,000', () => {
    expect(() => amountSchema.parse(1_000_001)).toThrow();
  });
});
