import { formatPHP } from './format';

describe('formatPHP', () => {
  it('formats centavos as PHP currency', () => {
    // 150000 centavos = ₱1,500.00
    const result = formatPHP(150_000);
    expect(result).toContain('1,500.00');
  });

  it('formats zero', () => {
    const result = formatPHP(0);
    expect(result).toContain('0.00');
  });

  it('formats large amounts', () => {
    // 5_000_000 centavos = ₱50,000.00
    const result = formatPHP(5_000_000);
    expect(result).toContain('50,000.00');
  });

  it('handles negative amounts', () => {
    // -50000 centavos = -₱500.00
    const result = formatPHP(-50_000);
    expect(result).toContain('500.00');
  });
});
