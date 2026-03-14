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
