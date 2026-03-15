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
  const lastDataUpdatedAt = useRef(0);

  const query = useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? currentInterval.current : false,
    refetchIntervalInBackground: !pauseWhenHidden,
  });

  // Adaptive interval — use dataUpdatedAt to detect data changes
  useEffect(() => {
    if (!adaptive) return;

    if (query.dataUpdatedAt === lastDataUpdatedAt.current) {
      // Data unchanged — slow down (max 5x base interval)
      const maxInterval = interval * 5;
      currentInterval.current = Math.min(currentInterval.current * 1.5, maxInterval);
    } else {
      // Data changed — reset to base interval
      currentInterval.current = interval;
      lastDataUpdatedAt.current = query.dataUpdatedAt;
    }
  }, [query.dataUpdatedAt, adaptive, interval]);

  return query;
}
