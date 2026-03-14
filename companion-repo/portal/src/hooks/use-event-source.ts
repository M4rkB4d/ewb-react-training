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
  const token = useAuthStore((s) => s.accessToken);

  // Use refs for callbacks to avoid reconnecting when handlers change
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

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
  }, [url, token, enabled]);

  return { connectionState };
}
