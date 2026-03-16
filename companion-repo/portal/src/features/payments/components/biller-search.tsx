import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '../api/payment-api';
import { paymentKeys } from '../api/query-keys';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { useDebounce } from '@/hooks/use-debounce';
import type { Biller } from '../types';

export function BillerSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const setBiller = usePaymentDraftStore((s) => s.setBiller);

  const { data: billers, isLoading } = useQuery({
    queryKey: paymentKeys.billerSearch(debouncedQuery),
    queryFn: () => paymentApi.searchBillers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (biller: Biller) => {
    setBiller(biller);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Biller</h2>
      <input
        type="search"
        placeholder="Search billers (e.g., Meralco, PLDT, Globe)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); }}
        className="w-full rounded border px-3 py-2"
        aria-label="Search billers"
      />

      {isLoading && <p className="text-sm text-gray-500">Searching...</p>}

      {billers != null && billers.length > 0 && (
        <ul className="space-y-2" role="listbox" aria-label="Search results">
          {billers.map((biller) => (
            <li key={biller.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => { handleSelect(biller); }}
                className="flex w-full items-center gap-3 rounded border p-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium">{biller.name}</span>
                <span className="text-sm text-gray-500">{biller.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {billers != null && billers.length === 0 && query.length >= 2 && (
        <p className="text-sm text-gray-500">No billers found.</p>
      )}
    </div>
  );
}
