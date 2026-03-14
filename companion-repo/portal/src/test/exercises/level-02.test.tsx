// Exercise tests for Level 2 — First App
// Tests: Transaction History Component, Account Dashboard
//
// Run: npm run test:exercises -- level-02

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Exercise 1: Transaction History Component ───────────────────────────────

describe('Exercise 1: Transaction History', () => {
  // Students create: src/features/accounts/components/transaction-history.tsx

  it('renders with sample transactions', async () => {
    const mod = await import('@/features/accounts/components/transaction-history');
    const TransactionHistory = mod.TransactionHistory || mod.default;
    expect(TransactionHistory).toBeDefined();

    const transactions = [
      { id: '1', description: 'Salary Deposit', amount: 5_000_000, type: 'credit' as const, date: '2026-03-12T00:00:00Z', status: 'completed' as const },
      { id: '2', description: 'Electric Bill', amount: 350_000, type: 'debit' as const, date: '2026-03-11T00:00:00Z', status: 'completed' as const },
    ];

    render(<TransactionHistory transactions={transactions} />);

    expect(screen.getByText('Salary Deposit')).toBeInTheDocument();
    expect(screen.getByText('Electric Bill')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', async () => {
    const mod = await import('@/features/accounts/components/transaction-history');
    const TransactionHistory = mod.TransactionHistory || mod.default;

    render(<TransactionHistory transactions={[]} />);

    expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
  });

  it('accepts a custom title prop', async () => {
    const mod = await import('@/features/accounts/components/transaction-history');
    const TransactionHistory = mod.TransactionHistory || mod.default;

    render(<TransactionHistory transactions={[]} title="March Transactions" />);

    expect(screen.getByText('March Transactions')).toBeInTheDocument();
  });

  it('defaults title to "Recent Transactions"', async () => {
    const mod = await import('@/features/accounts/components/transaction-history');
    const TransactionHistory = mod.TransactionHistory || mod.default;

    render(<TransactionHistory transactions={[]} />);

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });
});

// ─── Exercise 2: Account Summary Dashboard ───────────────────────────────────

describe('Exercise 2: Account Dashboard', () => {
  // Students create: src/features/accounts/components/account-dashboard.tsx

  it('renders account cards', async () => {
    const mod = await import('@/features/accounts/components/account-dashboard');
    const AccountDashboard = mod.AccountDashboard || mod.default;
    expect(AccountDashboard).toBeDefined();

    const accounts = [
      { id: '1', accountName: 'Savings Account', accountNumber: '1234567890', balance: 15_000_000, type: 'savings' as const, status: 'active' as const },
      { id: '2', accountName: 'Checking Account', accountNumber: '0987654321', balance: 5_000_000, type: 'checking' as const, status: 'active' as const },
    ];

    render(<AccountDashboard accounts={accounts} />);

    expect(screen.getByText('Savings Account')).toBeInTheDocument();
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
  });

  it('masks account numbers by default', async () => {
    const mod = await import('@/features/accounts/components/account-dashboard');
    const AccountDashboard = mod.AccountDashboard || mod.default;

    const accounts = [
      { id: '1', accountName: 'Test', accountNumber: '1234567890', balance: 10_000_000, type: 'savings' as const, status: 'active' as const },
    ];

    render(<AccountDashboard accounts={accounts} />);

    // The full account number should NOT be visible — it should be masked
    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
    // Partial match: last 4 digits should be visible
    expect(screen.getByText(/7890/)).toBeInTheDocument();
  });
});
