import type { DomainEvent, DomainEventType, EventHandler } from "./types";

const handlers = new Map<DomainEventType | "*", Set<EventHandler>>();
const processedKeys = new Set<string>();

export function onEvent(type: DomainEventType | "*", handler: EventHandler): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type)!.add(handler);
  return () => handlers.get(type)?.delete(handler);
}

export async function emitEvent(event: DomainEvent): Promise<void> {
  if (event.idempotencyKey && processedKeys.has(event.idempotencyKey)) {
    return;
  }
  if (event.idempotencyKey) {
    processedKeys.add(event.idempotencyKey);
  }

  const specific = handlers.get(event.type) ?? new Set();
  const wildcard = handlers.get("*") ?? new Set();

  for (const handler of [...specific, ...wildcard]) {
    try {
      await handler(event);
    } catch {
      // handlers must not break the bus
    }
  }
}

export function createEvent<T extends Record<string, unknown>>(
  type: DomainEventType,
  payload: T,
  meta?: { userId?: string; profileId?: string; idempotencyKey?: string }
): DomainEvent<T> {
  return {
    type,
    payload,
    userId: meta?.userId,
    profileId: meta?.profileId,
    idempotencyKey: meta?.idempotencyKey,
    occurredAt: new Date().toISOString(),
  };
}
