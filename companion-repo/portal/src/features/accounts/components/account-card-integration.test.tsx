import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAccounts } from '../hooks/use-accounts';
import { AccountCard } from './account-card';

// Integration test: MSW → useAccounts → AccountCard
function AccountCardFromAPI() {
  const { data: accounts, isLoading } = useAccounts();

  if (isLoading) return <p>Loading...</p>;
  if (accounts == null || accounts.length === 0) return <p>No accounts</p>;

  const account = accounts[0]!;
  return (
    <AccountCard
      accountName={account.name}
      accountNumber={account.number}
      accountType={account.type}
      balance={account.balance}
      currency={account.currency}
      isActive={account.isActive}
    />
  );
}

describe('AccountCard integration with MSW', () => {
  it('fetches data via MSW and renders a masked account card', async () => {
    renderWithProviders(<AccountCardFromAPI />);

    // Loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for API data to arrive
    await waitFor(() => {
      expect(screen.getByText('Personal Savings')).toBeInTheDocument();
    });

    // Account number is masked — DPA compliance
    expect(screen.getByText('••••7890')).toBeInTheDocument();
    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();

    // Balance is formatted
    expect(screen.getByText(/150,000\.00/)).toBeInTheDocument();
  });
});
