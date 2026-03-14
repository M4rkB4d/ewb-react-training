// src/hooks/use-polling.ts
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

interface UsePollingOptions {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
  /** Base interval in milliseconds */
  interval: number;
  /** Only poll when the tab is visible */
  pauseWhenHidden?: boolean;
  /** Increase interval when data has not changed */
  adaptive?: boolean;
  enabled?: boolean;
}

export function usePolling({
  queryKey,
  queryFn,
  interval,
  pauseWhenHidden = true,
  adaptive = false,
  enabled = true,
}: UsePollingOptions) {
  const queryClient = useQueryClient();
  const currentInterval = useRef(interval);

  const query = useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? currentInterval.current : false,
    refetchIntervalInBackground: !pauseWhenHidden,
  });

  // Adaptive interval — slow down when data is unchanged
  useEffect(() => {
    if (!adaptive) return;

    if (query.isSuccess && !query.isRefetching) {
      // If data hash is the same, increase interval (max 5x base)
      const maxInterval = interval * 5;
      currentInterval.current = Math.min(currentInterval.current * 1.5, maxInterval);
    }
  }, [query.dataUpdatedAt, adaptive, interval]);

  // Reset interval when data actually changes
  useEffect(() => {
    if (adaptive) {
      currentInterval.current = interval;
    }
  }, [JSON.stringify(query.data), adaptive, interval]);

  return query;
}
