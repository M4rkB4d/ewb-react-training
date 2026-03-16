// src/features/beneficiaries/components/beneficiary-form.tsx
// Level 3 Exercise 1 — Beneficiary Registration Form
import { useState } from 'react';
import { BeneficiarySchema, type Beneficiary } from '@/schemas/beneficiary';
import type { ZodIssue } from 'zod';

interface BeneficiaryFormProps {
  onSubmit: (data: Beneficiary) => void;
}

export function BeneficiaryForm({ onSubmit }: BeneficiaryFormProps) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    accountNumber: '',
    bankName: '',
    mobileNumber: '',
    email: '',
    relationship: 'family' as const,
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const result = BeneficiarySchema.safeParse(form);
    if (result.success) {
      onSubmit(result.data);
    } else {
      setErrors(result.error.issues);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={(e) => { handleChange('fullName', e.target.value); }}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            value={form.accountNumber}
            onChange={(e) => { handleChange('accountNumber', e.target.value); }}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="bankName" className="block text-sm font-medium">
            Bank Name
          </label>
          <input
            id="bankName"
            type="text"
            value={form.bankName}
            onChange={(e) => { handleChange('bankName', e.target.value); }}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium">
            Mobile Number
          </label>
          <input
            id="mobileNumber"
            type="tel"
            value={form.mobileNumber}
            onChange={(e) => { handleChange('mobileNumber', e.target.value); }}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => { handleChange('email', e.target.value); }}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="relationship" className="block text-sm font-medium">
            Relationship
          </label>
          <select
            id="relationship"
            value={form.relationship}
            onChange={(e) => { handleChange('relationship', e.target.value); }}
            className="mt-1 block w-full rounded border px-3 py-2"
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((err, i) => (
            <p key={i} role="alert" className="text-sm text-red-600">
              {err.message}
            </p>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="mt-6 rounded bg-ewb-purple px-4 py-2 text-white hover:bg-ewb-purple-700"
      >
        Register Beneficiary
      </button>
    </form>
  );
}
