// src/hooks/use-polling.ts
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

interface UsePollingOptions<TData = unknown, TSelected = TData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  /** Transform/select data from the query result */
  select?: (data: TData) => TSelected;
  /** Base interval in milliseconds */
  interval: number;
  /** Only poll when the tab is visible */
  pauseWhenHidden?: boolean;
  /** Increase interval when data has not changed */
  adaptive?: boolean;
  enabled?: boolean;
}

export function usePolling<TData = unknown, TSelected = TData>({
  queryKey,
  queryFn,
  select,
  interval,
  pauseWhenHidden = true,
  adaptive = false,
  enabled = true,
}: UsePollingOptions<TData, TSelected>) {
  const queryClient = useQueryClient();
  const [currentInterval, setCurrentInterval] = useState(interval);
  const lastDataUpdatedAt = useRef(0);

  const query = useQuery({
    queryKey,
    queryFn,
    select,
    refetchInterval: enabled ? currentInterval : false,
    refetchIntervalInBackground: !pauseWhenHidden,
  });

  // Adaptive interval — use dataUpdatedAt to detect data changes
  useEffect(() => {
    if (!adaptive) return;

    if (query.dataUpdatedAt === lastDataUpdatedAt.current) {
      // Data unchanged — slow down (max 5x base interval)
      const maxInterval = interval * 5;
      setCurrentInterval((prev) => Math.min(prev * 1.5, maxInterval));
    } else {
      // Data changed — reset to base interval
      setCurrentInterval(interval);
      lastDataUpdatedAt.current = query.dataUpdatedAt;
    }
  }, [query.dataUpdatedAt, adaptive, interval]);

  return query;
}
