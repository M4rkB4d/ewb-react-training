import { render } from '@testing-library/react';
import axeMatchers from '@chialab/vitest-axe';
import axeCore from 'axe-core';
import { AccountCard } from './account-card';

expect.extend(axeMatchers);

async function axe(container: Element) {
  return axeCore.run(container);
}

describe('AccountCard accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <AccountCard
        accountName="Personal Savings"
        accountNumber="1234567890"
        accountType="savings"
        balance={15_000_000}
        isActive={true}
        onTransfer={() => {}}
        onViewDetails={() => {}}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when inactive (no action buttons)', async () => {
    const { container } = render(
      <AccountCard
        accountName="Time Deposit"
        accountNumber="9876543210"
        accountType="time-deposit"
        balance={50_000_000} // centavos — ₱500,000.00
        isActive={false}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
