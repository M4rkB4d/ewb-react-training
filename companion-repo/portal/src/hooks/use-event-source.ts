// src/hooks/use-event-source.ts
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

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
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated');

  // Use refs for callbacks to avoid reconnecting when handlers change
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    setConnectionState('connecting');
    // Cookie-based auth: withCredentials sends HttpOnly cookies automatically.
    // NEVER pass tokens as query parameters — they appear in server logs, browser
    // history, and Referer headers. BSP 808 requires token confidentiality.
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionState('connected');
    };

    es.onmessage = (event) => {
      onMessageRef.current(event);
    };

    es.onerror = (event) => {
      setConnectionState('error');
      onErrorRef.current?.(event);
      // EventSource auto-reconnects — no manual retry needed
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnectionState('disconnected');
    };
  }, [url, isAuthenticated, enabled]);

  return { connectionState };
}
