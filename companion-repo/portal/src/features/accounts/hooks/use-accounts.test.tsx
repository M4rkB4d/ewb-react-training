import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAccounts } from './use-accounts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useAccounts', () => {
  it('fetches accounts from the API via MSW', async () => {
    const { result } = renderHook(() => useAccounts(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // MSW handler returns one account
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toMatchObject({
      id: 'acc-1',
      name: 'Personal Savings',
      type: 'savings',
      balance: 15_000_000,
    });
  });

  it('validates response data with Zod', async () => {
    // The useAccounts hook uses getAccounts() which parses with accountSchema.
    // If MSW returns valid data, parsing succeeds.
    const { result } = renderHook(() => useAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const account = result.current.data?.[0];
    // Zod would have thrown if these types were wrong
    expect(typeof account?.id).toBe('string');
    expect(typeof account?.balance).toBe('number');
    expect(typeof account?.isActive).toBe('boolean');
  });
});
