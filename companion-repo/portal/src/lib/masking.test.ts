import { maskValue, maskAccountNumber, maskEmail, maskPhone, maskName } from './masking';

describe('maskValue', () => {
  it('masks all but the last N characters', () => {
    expect(maskValue('1234567890', 4)).toBe('••••••7890');
  });

  it('returns the value unchanged if shorter than visibleChars', () => {
    expect(maskValue('123', 4)).toBe('123');
  });

  it('handles exact length match', () => {
    expect(maskValue('1234', 4)).toBe('1234');
  });

  it('handles empty string', () => {
    expect(maskValue('', 4)).toBe('');
  });
});

describe('maskAccountNumber', () => {
  it('shows only the last 4 digits', () => {
    expect(maskAccountNumber('1234567890')).toBe('••••••7890');
  });
});

describe('maskEmail', () => {
  it('masks the local part, preserving first and last characters', () => {
    const result = maskEmail('juan.santos@ewb.com');
    expect(result).toMatch(/^j•+s@ewb\.com$/);
  });

  it('returns placeholder for invalid email', () => {
    expect(maskEmail('nope')).toBe('••••@••••');
  });
});

describe('maskPhone', () => {
  it('shows only the last 4 digits', () => {
    // +63 917 123 4567 → 12 digits → 8 dots + 4567
    expect(maskPhone('+63 917 123 4567')).toBe('••••••••4567');
  });
});

describe('maskName', () => {
  it('masks each name part, preserving first letter', () => {
    expect(maskName('Juan Santos')).toBe('J••• S•••••');
  });

  it('handles single name', () => {
    expect(maskName('Juan')).toBe('J•••');
  });
});
