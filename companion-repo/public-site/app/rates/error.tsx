// app/rates/error.tsx
'use client'; // error.tsx MUST be a Client Component

import { useEffect } from 'react';

export default function RatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Application Insights (from B06)
    console.error('Rates page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900">
        Unable to Load Exchange Rates
      </h2>
      <p className="mt-4 text-gray-600">
        We could not retrieve the latest exchange rates. This may be a temporary
        issue — please try again in a moment.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-ewb-purple px-6 py-2 text-white hover:bg-ewb-purple/90"
      >
        Try Again
      </button>
      {error.digest && (
        <p className="mt-4 text-xs text-gray-400">
          Error reference: {error.digest}
        </p>
      )}
    </div>
  );
}
