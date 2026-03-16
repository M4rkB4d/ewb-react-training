// src/lib/event-bus.ts
type EventHandler<T = unknown> = (payload: T) => void;

const handlers = new Map<string, Set<EventHandler>>();

export function on<T>(event: string, handler: EventHandler<T>): () => void {
  if (!handlers.has(event)) {
    handlers.set(event, new Set());
  }
  handlers.get(event)!.add(handler as EventHandler);

  // Return unsubscribe function
  return () => {
    handlers.get(event)?.delete(handler as EventHandler);
  };
}

export function emit<T>(event: string, payload: T): void {
  handlers.get(event)?.forEach((handler) => { handler(payload); });
}
