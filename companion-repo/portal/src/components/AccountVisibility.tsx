// src/components/AccountVisibility.tsx
import { useState } from 'react';

/** @param balance — Balance in centavos (integer). Divided by 100 for display. */
function AccountBalance({ balance }: { balance: number }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">
        {isVisible
          ? new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(balance / 100)
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
