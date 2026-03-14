// src/lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from './api-error';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // BSP 1019 — Log all API errors for monitoring
      console.error('[QueryCache Error]', error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('[MutationCache Error]', error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        // Never retry auth errors
        if (error instanceof ApiError && error.isAuthError) return false;
        // Never retry validation errors
        if (error instanceof ApiError && error.isValidationError) return false;
        // Retry everything else up to 2 times
        return failureCount < 2;
      },
    },
  },
});
