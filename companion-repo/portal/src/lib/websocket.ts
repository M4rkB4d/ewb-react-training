// src/lib/websocket.ts
import { z } from 'zod';

type MessageHandler = (data: unknown) => void;

// Zod schema for WebSocket message envelope
const wsMessageSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
});

interface WebSocketOptions {
  url: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function createWebSocket(options: WebSocketOptions) {
  const {
    url,
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

    // Cookie-based auth: the browser sends HttpOnly cookies on the upgrade request.
    // NEVER pass tokens in sub-protocols — they leak in server logs and proxy headers.
    ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttempts = 0;
      onOpen?.();
    };

    ws.onmessage = (event) => {
      const parsed = wsMessageSchema.safeParse(
        (() => { try { return JSON.parse(event.data); } catch { return null; } })()
      );
      if (!parsed.success) return; // Ignore malformed messages
      const { type, payload } = parsed.data;
      const channelHandlers = handlers.get(type);
      channelHandlers?.forEach((handler) => { handler(payload); });
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
