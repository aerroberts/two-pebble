/**
 * Primitive event payload value.
 *
 * Event payloads stay serializable enough for browser and server consumers.
 */
export type EventValue = boolean | null | number | object | string | undefined;

/**
 * Ordered event argument list.
 *
 * Each event name maps to one payload tuple.
 */
export type EventPayload = EventValue[];

/**
 * Typed event-name to payload mapping.
 *
 * Consumers provide this map to make listener and emitter calls type-safe.
 */
export type EventMap = Record<string, EventPayload>;

/**
 * Callback invoked when an event is emitted.
 *
 * The callback receives the payload tuple for the subscribed event.
 */
export type EventListener<TArgs extends EventPayload> = (...args: TArgs) => void;
