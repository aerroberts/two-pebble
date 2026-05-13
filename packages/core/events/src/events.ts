export type EventMap = Record<string, unknown[]>;
export type EventListener<TArgs extends unknown[]> = (...args: TArgs) => void;

// Minimal typed event emitter. Lives outside of node:events / node:stream so it can be used in both server and browser bundles.
export class Events<TEvents extends EventMap> {
  private readonly listeners: { [K in keyof TEvents]?: Array<EventListener<TEvents[K]>> } = {};

  public on<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): this {
    const bucket = this.listeners[event] ?? [];
    bucket.push(listener);
    this.listeners[event] = bucket;
    return this;
  }

  public off<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): this {
    const bucket = this.listeners[event];
    if (!bucket) return this;
    const index = bucket.indexOf(listener);
    if (index !== -1) bucket.splice(index, 1);
    return this;
  }

  public once<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): this {
    const wrapped: EventListener<TEvents[K]> = (...args) => {
      this.off(event, wrapped);
      listener(...args);
    };
    return this.on(event, wrapped);
  }

  public emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): boolean {
    const bucket = this.listeners[event];
    if (!bucket?.length) return false;
    for (const listener of [...bucket]) listener(...args);
    return true;
  }
}
