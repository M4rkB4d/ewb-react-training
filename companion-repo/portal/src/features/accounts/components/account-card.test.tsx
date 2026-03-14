import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountCard } from './account-card';

const defaultProps = {
  accountName: 'Personal Savings',
  accountNumber: '1234567890',
  accountType: 'savings' as const,
  balance: 15_000_000, // centavos — ₱150,000.00
  isActive: true,
};

describe('AccountCard', () => {
  it('renders account name and masked number', () => {
    render(<AccountCard {...defaultProps} />);

    expect(screen.getByText('Personal Savings')).toBeInTheDocument();
    expect(screen.getByText('••••7890')).toBeInTheDocument();
  });

  it('masks the account number — DPA compliance', () => {
    render(<AccountCard {...defaultProps} />);

    // Full number should NOT appear anywhere
    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
    // Only last 4 visible
    expect(screen.getByText('••••7890')).toBeInTheDocument();
  });

  it('formats balance as PHP currency', () => {
    render(<AccountCard {...defaultProps} />);

    expect(screen.getByText(/150,000\.00/)).toBeInTheDocument();
  });

  it('displays account type badge', () => {
    render(<AccountCard {...defaultProps} accountType="checking" />);

    expect(screen.getByText('Checking')).toBeInTheDocument();
  });

  it('shows active status indicator', () => {
    render(<AccountCard {...defaultProps} isActive={true} />);

    expect(screen.getByLabelText('Active account')).toBeInTheDocument();
  });

  it('shows inactive status indicator', () => {
    render(<AccountCard {...defaultProps} isActive={false} />);

    expect(screen.getByLabelText('Inactive account')).toBeInTheDocument();
  });

  it('renders action buttons when active and callbacks provided', async () => {
    const onTransfer = vi.fn();
    const onViewDetails = vi.fn();
    const user = userEvent.setup();

    render(
      <AccountCard
        {...defaultProps}
        onTransfer={onTransfer}
        onViewDetails={onViewDetails}
      />,
    );

    await user.click(screen.getByRole('button', { name: /transfer/i }));
    expect(onTransfer).toHaveBeenCalledWith('1234567890');

    await user.click(screen.getByRole('button', { name: /view details/i }));
    expect(onViewDetails).toHaveBeenCalledWith('1234567890');
  });

  it('hides action buttons when inactive', () => {
    render(
      <AccountCard
        {...defaultProps}
        isActive={false}
        onTransfer={() => {}}
        onViewDetails={() => {}}
      />,
    );

    expect(screen.queryByRole('button', { name: /transfer/i })).not.toBeInTheDocument();
  });
});
