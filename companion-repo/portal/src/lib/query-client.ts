// src/lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import axios from 'axios';
import { logger } from './logger';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // BSP 1019 — Log all API errors for monitoring
      logger.error('[QueryCache]', { error: String(error) });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      logger.error('[MutationCache]', { error: String(error) });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        // The interceptor rejects with raw AxiosError, so check status directly
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          // Never retry auth errors (401 already handled by interceptor)
          if (status === 401 || status === 403) return false;
          // Never retry validation errors
          if (status === 422) return false;
        }
        // Retry everything else up to 2 times
        return failureCount < 2;
      },
    },
  },
});
