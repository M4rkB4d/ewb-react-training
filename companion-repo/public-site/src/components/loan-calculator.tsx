// src/components/loan-calculator.tsx
'use client';

import { useState } from 'react';

export function LoanCalculator() {
  const [principal, setPrincipal] = useState(100_000);
  const [rate, setRate] = useState(8.5);
  const [term, setTerm] = useState(12);

  const monthly = rate === 0
    ? principal / term
    : (principal * (rate / 100 / 12)) /
      (1 - Math.pow(1 + rate / 100 / 12, -term));

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">Loan Calculator</h3>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Amount (₱)</span>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Annual Rate (%)</span>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Term (months)</span>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border px-3 py-2"
          />
        </label>
        <p className="text-lg font-semibold text-ewb-purple">
          Monthly payment: ₱{monthly.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
