// src/components/AccountVisibility.tsx
import { useState } from 'react';

function AccountBalance({ balance }: { balance: number }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">
        {isVisible
          ? new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(balance)
          : '****'}
      </span>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-sm text-primary underline"
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export default AccountBalance;
