import { formatPHP } from './format';

describe('formatPHP', () => {
  it('formats a number as PHP currency', () => {
    const result = formatPHP(150000);
    // Intl.NumberFormat output varies by runtime, check key parts
    expect(result).toContain('150,000.00');
  });

  it('formats zero', () => {
    const result = formatPHP(0);
    expect(result).toContain('0.00');
  });

  it('rounds to 2 decimal places', () => {
    const result = formatPHP(1234.567);
    expect(result).toContain('1,234.57');
  });

  it('handles negative amounts', () => {
    const result = formatPHP(-500);
    expect(result).toContain('500.00');
  });
});
