// src/hooks/use-websocket.ts
import { useEffect, useRef, useState } from 'react';
import { createWebSocket } from '@/lib/websocket';
import { useAuthStore } from '@/stores/auth-store';

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
