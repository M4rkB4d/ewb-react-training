// Exercise tests for Level 3 — Building UI
// Tests: Beneficiary Form, Accessible Data Table, Design System Extension
//
// Run: npm run test:exercises -- level-03

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Exercise 1: Beneficiary Registration Form ──────────────────────────────

describe('Exercise 1: Beneficiary Form', () => {
  // Students create: src/schemas/beneficiary.ts + src/features/beneficiaries/components/beneficiary-form.tsx

  describe('Zod Schema', () => {
    it('validates a well-formed beneficiary', async () => {
      const mod = await import('@/schemas/beneficiary');
      const schema = mod.BeneficiarySchema || mod.beneficiarySchema;
      expect(schema).toBeDefined();

      const valid = {
        fullName: 'Juan Dela Cruz',
        accountNumber: '1234567890',
        bankName: 'EastWest Bank',
        mobileNumber: '+639171234567',
        relationship: 'family',
      };

      const result = schema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects short name', async () => {
      const mod = await import('@/schemas/beneficiary');
      const schema = mod.BeneficiarySchema || mod.beneficiarySchema;

      const result = schema.safeParse({
        fullName: 'J',
        accountNumber: '1234567890',
        bankName: 'EastWest Bank',
        mobileNumber: '+639171234567',
        relationship: 'family',
      });

      expect(result.success).toBe(false);
    });

    it('rejects invalid phone number', async () => {
      const mod = await import('@/schemas/beneficiary');
      const schema = mod.BeneficiarySchema || mod.beneficiarySchema;

      const result = schema.safeParse({
        fullName: 'Juan Dela Cruz',
        accountNumber: '1234567890',
        bankName: 'EastWest Bank',
        mobileNumber: '12345', // invalid
        relationship: 'family',
      });

      expect(result.success).toBe(false);
    });

    it('accepts optional email when valid', async () => {
      const mod = await import('@/schemas/beneficiary');
      const schema = mod.BeneficiarySchema || mod.beneficiarySchema;

      const result = schema.safeParse({
        fullName: 'Juan Dela Cruz',
        accountNumber: '1234567890',
        bankName: 'EastWest Bank',
        mobileNumber: '+639171234567',
        email: 'juan@example.com',
        relationship: 'family',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Form Component', () => {
    it('renders all required fields', async () => {
      const mod = await import('@/features/beneficiaries/components/beneficiary-form');
      const BeneficiaryForm = mod.BeneficiaryForm || mod.default;
      expect(BeneficiaryForm).toBeDefined();

      render(<BeneficiaryForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile/i)).toBeInTheDocument();
    });

    it('shows validation errors on empty submit', async () => {
      const mod = await import('@/features/beneficiaries/components/beneficiary-form');
      const BeneficiaryForm = mod.BeneficiaryForm || mod.default;
      const user = userEvent.setup();

      render(<BeneficiaryForm onSubmit={() => {}} />);

      const submitBtn = screen.getByRole('button', { name: /submit|register|save/i });
      await user.click(submitBtn);

      // At least one error should appear
      const errors = screen.getAllByRole('alert');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

// ─── Exercise 2: Accessible Data Table ───────────────────────────────────────

describe('Exercise 2: Accessible Data Table', () => {
  // Students create: src/components/ui/data-table.tsx

  it('renders a table with proper ARIA attributes', async () => {
    const mod = await import('@/components/ui/data-table');
    const DataTable = mod.DataTable || mod.default;
    expect(DataTable).toBeDefined();

    const columns = [
      { key: 'name', header: 'Account Name' },
      { key: 'balance', header: 'Balance' },
    ];

    const data = [
      { name: 'Savings', balance: '₱150,000.00' },
      { name: 'Checking', balance: '₱50,000.00' },
    ];

    render(<DataTable columns={columns} data={data} caption="Account Balances" />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Account Balances')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });
});
