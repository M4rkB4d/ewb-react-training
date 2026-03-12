# A19 — Real-Time Patterns

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 8 — Mastery · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Choose between WebSocket, SSE, and polling for different use cases
- Implement a WebSocket connection with reconnection logic
- Use Server-Sent Events for one-way real-time updates
- Build smart polling with adaptive intervals
- Integrate real-time data with TanStack Query
- Handle connection state and offline recovery

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B03 — API Integration | Level 5 |
| Completed A09 — State Management | Level 4 |

---

## Phase 1 — Choosing the Right Pattern

### When to use each approach

| Pattern | Direction | Use Case | Complexity |
|---------|-----------|----------|------------|
| **Polling** | Client → Server | Balance checks, transaction status | Low |
| **SSE** | Server → Client | Notifications, transaction alerts | Medium |
| **WebSocket** | Bidirectional | Chat support, live trading, real-time transfers | High |

### Decision guide for banking apps

| Feature | Recommended Pattern | Why |
|---------|-------------------|-----|
| Account balance | Smart polling (30s) | Changes are infrequent, polling is simple |
| Transaction alerts | SSE | Server pushes when transactions occur |
| Transfer status | Polling (5s while pending) | Short-lived, transitions to final state |
| Customer support chat | WebSocket | Bidirectional, real-time messaging |
| Exchange rates | SSE | Continuous server-driven updates |
| Session heartbeat | Polling (60s) | Keep-alive, detect server-side logout |

### Checkpoint 1

A product manager asks for real-time balance updates that show immediately
when a transfer is received. Which pattern would you use and why?

Answer: SSE (Server-Sent Events) is ideal. Balance updates flow one way
(server → client), SSE auto-reconnects, and it works through most proxies.
WebSocket is overkill because the client does not need to send data on this
channel. Polling with a short interval would work but wastes bandwidth when
no transactions are occurring.

---

## Phase 2 — Smart Polling

### Adaptive polling hook

```tsx
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
```

### Using smart polling for balance

```tsx
// src/features/accounts/hooks/use-live-balance.ts
import { usePolling } from '@/hooks/use-polling';
import { accountsApi } from '../api/accounts-api';
import { accountKeys } from '../api/query-keys';

export function useLiveBalance(accountId: string) {
  return usePolling({
    queryKey: accountKeys.balance(accountId),
    queryFn: () => accountsApi.getBalance(accountId),
    interval: 30_000, // 30 seconds base
    adaptive: true,   // Slow down if balance is unchanged
    pauseWhenHidden: true,
  });
}
```

---

## Phase 3 — Server-Sent Events

### SSE connection hook

```tsx
// src/hooks/use-event-source.ts
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth-store';

interface UseEventSourceOptions {
  url: string;
  onMessage: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  enabled?: boolean;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useEventSource({
  url,
  onMessage,
  onError,
  enabled = true,
}: UseEventSourceOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!enabled || token == null) return;

    // SSE does not support custom headers — pass token as query parameter
    // The backend should validate this token the same way it validates Bearer tokens
    const sseUrl = `${url}?token=${encodeURIComponent(token)}`;

    setConnectionState('connecting');
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionState('connected');
    };

    es.onmessage = (event) => {
      onMessage(event);
    };

    es.onerror = (event) => {
      setConnectionState('error');
      onError?.(event);
      // EventSource auto-reconnects — no manual retry needed
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnectionState('disconnected');
    };
  }, [url, token, enabled]);

  return { connectionState };
}
```

### Transaction alerts with SSE

```tsx
// src/features/accounts/hooks/use-transaction-alerts.ts
import { useEventSource } from '@/hooks/use-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { accountKeys } from '../api/query-keys';
import { useCallback } from 'react';

interface TransactionAlert {
  type: 'credit' | 'debit';
  accountId: string;
  amount: number;
  description: string;
  timestamp: string;
}

export function useTransactionAlerts(accountId: string) {
  const queryClient = useQueryClient();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const alert: TransactionAlert = JSON.parse(event.data);

      // Invalidate account balance — TanStack Query will refetch
      queryClient.invalidateQueries({
        queryKey: accountKeys.balance(alert.accountId),
      });

      // Invalidate transaction list
      queryClient.invalidateQueries({
        queryKey: accountKeys.transactions(alert.accountId),
      });
    },
    [queryClient],
  );

  return useEventSource({
    url: `/api/accounts/${accountId}/events`,
    onMessage: handleMessage,
    enabled: accountId.length > 0,
  });
}
```

### Using alerts in a component

```tsx
// src/features/accounts/components/account-detail.tsx
import { useTransactionAlerts } from '../hooks/use-transaction-alerts';

export function AccountDetail({ accountId }: { accountId: string }) {
  const { connectionState } = useTransactionAlerts(accountId);

  return (
    <div>
      {/* Connection indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span
          className={`h-2 w-2 rounded-full ${
            connectionState === 'connected' ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
        {connectionState === 'connected' ? 'Live' : 'Connecting...'}
      </div>

      {/* Account details and transactions use standard TanStack Query hooks */}
      {/* SSE invalidates the queries when new transactions arrive */}
    </div>
  );
}
```

### Checkpoint 2

SSE does not support custom headers — you cannot send a Bearer token in the
Authorization header. How does the hook above solve this? What are the
security implications?

Answer: The hook passes the token as a query parameter. The security
implication is that the token appears in server access logs and browser
history. Mitigations: use short-lived tokens specifically for SSE, ensure
the SSE endpoint only returns non-sensitive notification data, and rotate
the token on reconnection.

---

## Phase 4 — WebSocket

### WebSocket connection manager

```tsx
// src/lib/websocket.ts
type MessageHandler = (data: unknown) => void;

interface WebSocketOptions {
  url: string;
  token: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function createWebSocket(options: WebSocketOptions) {
  const {
    url,
    token,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const handlers = new Map<string, Set<MessageHandler>>();
  let isDestroyed = false;

  function connect(): void {
    if (isDestroyed) return;

    // Pass token in WebSocket protocol (sub-protocol auth)
    ws = new WebSocket(url, [`auth-${token}`]);

    ws.onopen = () => {
      reconnectAttempts = 0;
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as { type: string; payload: unknown };
        const channelHandlers = handlers.get(message.type);
        channelHandlers?.forEach((handler) => handler(message.payload));
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      onClose?.();
      if (!isDestroyed && reconnectAttempts < maxReconnectAttempts) {
        const delay = reconnectInterval * Math.pow(2, reconnectAttempts);
        reconnectAttempts += 1;
        reconnectTimer = setTimeout(connect, Math.min(delay, 30_000));
      }
    };

    ws.onerror = (error) => {
      onError?.(error);
    };
  }

  function subscribe(channel: string, handler: MessageHandler): () => void {
    if (!handlers.has(channel)) {
      handlers.set(channel, new Set());
    }
    handlers.get(channel)!.add(handler);

    return () => {
      handlers.get(channel)?.delete(handler);
    };
  }

  function send(type: string, payload: unknown): void {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  function destroy(): void {
    isDestroyed = true;
    if (reconnectTimer != null) clearTimeout(reconnectTimer);
    ws?.close();
    handlers.clear();
  }

  connect();

  return { subscribe, send, destroy };
}
```

### WebSocket React hook

```tsx
// src/hooks/use-websocket.ts
import { useEffect, useRef, useState } from 'react';
import { createWebSocket } from '@/lib/websocket';
import { useAuthStore } from '@/features/auth/stores/auth-store';

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export function useWebSocket(url: string) {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const wsRef = useRef<ReturnType<typeof createWebSocket> | null>(null);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (token == null) return;

    const ws = createWebSocket({
      url,
      token,
      onOpen: () => setState('connected'),
      onClose: () => setState('disconnected'),
    });

    wsRef.current = ws;
    setState('connecting');

    return () => {
      ws.destroy();
      wsRef.current = null;
      setState('disconnected');
    };
  }, [url, token]);

  const subscribe = (channel: string, handler: (data: unknown) => void) => {
    return wsRef.current?.subscribe(channel, handler) ?? (() => {});
  };

  const send = (type: string, payload: unknown) => {
    wsRef.current?.send(type, payload);
  };

  return { state, subscribe, send };
}
```

---

## Phase 5 — Connection State Management

### Online/offline detection

```tsx
// src/hooks/use-online-status.ts
import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
```

### Offline banner

```tsx
// src/components/offline-banner.tsx
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-800"
      role="alert"
    >
      You are offline. Some features may be unavailable. Data will sync when
      your connection is restored.
    </div>
  );
}
```

### Reconnection strategy

| Attempt | Delay | Total Wait |
|---------|-------|------------|
| 1 | 3s | 3s |
| 2 | 6s | 9s |
| 3 | 12s | 21s |
| 4 | 24s | 45s |
| 5+ | 30s (max) | — |

The exponential backoff with a 30-second cap prevents overwhelming the
server during outages while still reconnecting quickly when the issue
is brief.

---

## Phase 6 — Integrating with TanStack Query

### Real-time query invalidation

The recommended pattern is to let TanStack Query manage the data while
real-time channels trigger invalidation:

```tsx
// src/features/accounts/hooks/use-account-with-live-updates.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { accountsApi } from '../api/accounts-api';
import { accountKeys } from '../api/query-keys';
import { useWebSocket } from '@/hooks/use-websocket';

export function useAccountWithLiveUpdates(accountId: string) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket('/ws/accounts');

  // Standard query — TanStack Query manages caching, loading, error states
  const query = useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => accountsApi.getById(accountId),
  });

  // Subscribe to real-time updates — invalidate instead of directly setting data
  useEffect(() => {
    const unsubscribe = subscribe('account:updated', (data: unknown) => {
      const update = data as { accountId: string };
      if (update.accountId === accountId) {
        // Invalidate triggers a fresh fetch — ensures data consistency
        queryClient.invalidateQueries({
          queryKey: accountKeys.detail(accountId),
        });
      }
    });
    return unsubscribe;
  }, [accountId, subscribe, queryClient]);

  return query;
}
```

### Why invalidate instead of set?

Directly setting query data from a WebSocket message skips validation
and can cause inconsistencies. Invalidation triggers a proper fetch
through the existing API layer, which includes Zod validation and
error handling.

---

## Key Takeaways

1. **Start with polling** — it is simple, reliable, and sufficient for most
   banking features. Only upgrade to SSE or WebSocket when polling falls short.

2. **SSE for server-to-client streams** — transaction alerts, notifications,
   rate updates. Auto-reconnects. No bidirectional communication needed.

3. **WebSocket for bidirectional** — customer support chat, live trading.
   Requires reconnection logic and state management.

4. **Adaptive polling** slows down when data is unchanged and speeds up when
   changes are detected. Saves bandwidth without sacrificing responsiveness.

5. **Integrate with TanStack Query via invalidation** — real-time channels
   trigger cache invalidation, not direct data updates. This preserves the
   existing data flow and validation.

---

## Exercises

### Exercise 1 — Transfer Status Tracker
Build a transfer status component that polls every 5 seconds while the
transfer is "pending", switches to 30-second polling once "processing",
and stops polling when the transfer reaches a final state.

### Exercise 2 — Exchange Rate Ticker
Build a live exchange rate display using SSE. Show USD/PHP and EUR/PHP
rates with visual indicators (green arrow up, red arrow down) when rates
change. Include a connection state indicator.

### Exercise 3 — Support Chat Widget
Build a basic customer support chat widget using the WebSocket hook.
Include message send/receive, typing indicators, connection state
display, and message history persistence.

---

## What Comes Next

Level 8 is complete. You now have architecture, internationalization,
a full capstone feature, and real-time patterns.

The **Appendix** provides reference materials:
- [X01 — EWB Design System Reference](../appendix/X01_ewb-design-system-reference.md)
- [X02 — BSP Circular Quick Reference](../appendix/X02_bsp-circular-quick-reference.md)
- [X03 — Migration from v1](../appendix/X03_migration-from-v1.md)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
