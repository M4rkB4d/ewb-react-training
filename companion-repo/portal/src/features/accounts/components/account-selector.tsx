// src/features/accounts/components/account-selector.tsx
import { useId } from 'react';
import { useAccounts } from '../hooks/use-accounts';
import { formatPHP } from '@/lib/format';
import type { Account } from '../types';

interface AccountSelectorProps {
  value: string;
  onChange: (accountId: string) => void;
  label?: string;
}

export function AccountSelector({ value, onChange, label = 'Select Account' }: AccountSelectorProps) {
  const { data: accounts, isLoading } = useAccounts();
  const selectId = useId();

  return (
    <div>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        disabled={isLoading}
        className="w-full rounded border px-3 py-2"
      >
        <option value="">— Choose an account —</option>
        {accounts?.map((account: Account) => (
          <option key={account.id} value={account.id}>
            {account.name} ({account.number}) — {formatPHP(account.balance)}
          </option>
        ))}
      </select>
    </div>
  );
}
