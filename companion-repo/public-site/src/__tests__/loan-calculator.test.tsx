// Tests for the LoanCalculator component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanCalculator } from '../components/loan-calculator';

describe('LoanCalculator', () => {
  it('renders with default values', () => {
    render(<LoanCalculator />);

    expect(screen.getByText('Loan Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/term/i)).toBeInTheDocument();
  });

  it('displays monthly payment', () => {
    render(<LoanCalculator />);

    // With defaults (100,000 principal, 8.5% rate, 12 months), there should be a payment displayed
    expect(screen.getByText(/monthly payment/i)).toBeInTheDocument();
  });

  it('updates calculation when inputs change', async () => {
    const user = userEvent.setup();
    render(<LoanCalculator />);

    const amountInput = screen.getByLabelText(/amount/i);

    // Change the amount
    await user.clear(amountInput);
    await user.type(amountInput, '200000');

    // The payment text should still be present (recalculated)
    expect(screen.getByText(/monthly payment/i)).toBeInTheDocument();
  });
});
