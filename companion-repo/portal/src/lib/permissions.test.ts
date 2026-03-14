import { hasMinimumRole, canAccessRoute } from './permissions';

describe('hasMinimumRole', () => {
  it('grants access when user role meets the requirement', () => {
    expect(hasMinimumRole('admin', 'customer')).toBe(true);
    expect(hasMinimumRole('manager', 'teller')).toBe(true);
    expect(hasMinimumRole('customer', 'customer')).toBe(true);
  });

  it('denies access when user role is below the requirement', () => {
    expect(hasMinimumRole('customer', 'teller')).toBe(false);
    expect(hasMinimumRole('teller', 'admin')).toBe(false);
  });
});

describe('canAccessRoute', () => {
  it('grants access if user has any of the required roles', () => {
    expect(canAccessRoute('manager', ['teller', 'manager'])).toBe(true);
    expect(canAccessRoute('admin', ['customer'])).toBe(true);
  });

  it('denies access if user role is below all required roles', () => {
    expect(canAccessRoute('customer', ['teller', 'manager'])).toBe(false);
  });
});
