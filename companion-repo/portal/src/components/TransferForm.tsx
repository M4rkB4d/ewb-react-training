// src/components/TransferForm.tsx
import { useState } from 'react';

interface TransferFormData {
  fromAccount: string;
  toAccount: string;
  amount: string;
  note: string;
}

function TransferForm() {
  const [form, setForm] = useState<TransferFormData>({
    fromAccount: '',
    toAccount: '',
    amount: '',
    note: '',
  });

  function handleChange(field: keyof TransferFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="space-y-4">
      <input
        value={form.fromAccount}
        onChange={(e) => handleChange('fromAccount', e.target.value)}
        placeholder="From Account"
      />
      <input
        value={form.toAccount}
        onChange={(e) => handleChange('toAccount', e.target.value)}
        placeholder="To Account"
      />
      <input
        value={form.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        placeholder="Amount (PHP)"
        type="number"
      />
      <input
        value={form.note}
        onChange={(e) => handleChange('note', e.target.value)}
        placeholder="Note (optional)"
      />
    </form>
  );
}

export default TransferForm;
