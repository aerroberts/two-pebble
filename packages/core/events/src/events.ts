import type { EventListener, EventMap } from './events.types';

/**
 * Minimal typed event emitter.
 *
 * This avoids node-only event dependencies so the same class works in browser
 * and server bundles.
 */
export class Events<TEvents extends EventMap> {
  private readonly listeners: { [K in keyof TEvents]?: Array<EventListener<TEvents[K]>> } = {};

  /**
   * Registers a listener for an event.
   *
   * Listener payload types are inferred from the event map.
   */
  public on<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): this {
    const bucket = this.listeners[event] ?? [];
    bucket.push(listener);
    this.listeners[event] = bucket;
    return this;
  }

  /**
   * Removes a previously registered listener.
   *
   * Missing listeners are ignored so cleanup can be idempotent.
   */
  public off<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): this {
    const bucket = this.listeners[event];
    if (!bucket) return this;
    const index = bucket.indexOf(listener);
    if (index !== -1) bucket.splice(index, 1);
    return this;
  }

  /**
   * Registers a listener that is removed after its first event.
   *
   * The wrapped listener preserves the event payload type.
   */
  public once<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): this {
    const wrapped: EventListener<TEvents[K]> = (...args) => {
      this.off(event, wrapped);
      listener(...args);
    };
    return this.on(event, wrapped);
  }

  /**
   * Emits an event to the current listener snapshot.
   *
   * Returns whether any listeners were invoked.
   */
  public emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): boolean {
    const bucket = this.listeners[event];
    if (!bucket?.length) return false;
    for (const listener of [...bucket]) listener(...args);
    return true;
  }
}
