// src/features/accounts/components/account-header.tsx
interface AccountHeaderProps {
  accountName: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
}

export function AccountHeader({ accountName, accountType }: AccountHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{accountName}</h2>
      <span className="rounded-full bg-ewb-purple-100 px-3 py-1 text-sm text-ewb-purple-700">
        {accountType}
      </span>
    </div>
  );
}
