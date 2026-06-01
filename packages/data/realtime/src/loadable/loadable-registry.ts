import { Loadable } from './loadable';
import type { LoadableRegistryItem, LoadableRegistryReadyItem, LoadableRegistryValue, LoadableStatus } from './types';

/**
 * Tracks a loadable map of loadable records.
 * The registry status describes the collection while each entry has its own status.
 * Every operation returns a new registry with cloned map state.
 */
export class LoadableRegistry<TValue> {
  public readonly loadable: Loadable<LoadableRegistryValue<TValue>>;

  public constructor() {
    this.loadable = new Loadable({ status: 'idle', value: new Map() });
  }

  /**
   * Returns the collection status.
   * Entry statuses remain available on each mapped loadable.
   * This is useful for full-list refreshes.
   */
  public get status(): LoadableStatus {
    return this.loadable.status;
  }

  /**
   * Returns the readonly registry map.
   * A null value means the collection has not loaded yet.
   * Mutating this map directly breaks realtime state identity.
   */
  public get value(): LoadableRegistryValue<TValue> | null {
    return this.loadable.value;
  }

  /**
   * Returns this registry with a different collection status.
   * Existing entries are preserved exactly as they are.
   * Use this before refreshes that should keep current values visible.
   */
  public withStatus(status: LoadableStatus): LoadableRegistry<TValue> {
    return this.fromLoadable(this.loadable.withStatus(status));
  }

  /**
   * Returns this registry with one item added or replaced.
   * The map is cloned before the entry is written.
   * Entry status is tracked independently from collection status.
   */
  public withItem(key: string, value: TValue, status: LoadableStatus): LoadableRegistry<TValue> {
    const nextValue = new Map(this.value ?? []);
    nextValue.set(key, new Loadable({ status, value }));
    return this.fromLoadable(this.loadable.withValue(nextValue));
  }

  /**
   * Returns this registry with one item removed.
   * The map is cloned before the entry is deleted.
   * Collection status becomes ready because the deletion is resolved.
   */
  public withoutItem(key: string): LoadableRegistry<TValue> {
    const nextValue = new Map(this.value ?? []);
    nextValue.delete(key);
    return this.fromLoadable(this.loadable.withValue(nextValue));
  }

  /**
   * Returns this registry with an entirely new item set.
   * Each item keeps the status supplied by the caller.
   * This is the right operation for full-list refreshes.
   */
  public withItems(items: LoadableRegistryItem<TValue>[]): LoadableRegistry<TValue> {
    const nextValue = new Map<string, Loadable<TValue>>();
    for (const item of items) {
      nextValue.set(item.id, new Loadable({ status: item.status, value: item.value }));
    }
    return this.fromLoadable(this.loadable.withValue(nextValue));
  }

  /**
   * Returns this registry with ready values keyed by their id.
   * This keeps callers from mapping plain server records into loadable records.
   * Use it when the source has already completed loading.
   */
  public withReadyItems(items: LoadableRegistryReadyItem<TValue>[]): LoadableRegistry<TValue> {
    const nextValue = new Map<string, Loadable<TValue>>();
    for (const item of items) {
      nextValue.set(item.id, new Loadable({ status: 'ready', value: item }));
    }
    return this.fromLoadable(this.loadable.withValue(nextValue));
  }

  /**
   * Returns this registry with ready values merged in by id.
   * Existing entries are preserved; only the supplied ids are added or replaced.
   * Use this for scoped list refreshes that share one registry, so a fetch for
   * one scope cannot drop entries owned by another scope or push events that
   * arrived in flight. Prefer withReadyItems only when the list is the sole,
   * authoritative source for the entire collection.
   */
  public withMergedReadyItems(items: LoadableRegistryReadyItem<TValue>[]): LoadableRegistry<TValue> {
    const nextValue = new Map(this.value ?? []);
    for (const item of items) {
      nextValue.set(item.id, new Loadable({ status: 'ready', value: item }));
    }
    return this.fromLoadable(this.loadable.withValue(nextValue));
  }

  /**
   * Returns the entry for one key.
   * Missing entries are represented as null instead of undefined.
   * This keeps hook selectors stable and explicit.
   */
  public getItem(key: string): Loadable<TValue> | null {
    return this.value?.get(key) ?? null;
  }

  /**
   * Returns ready entry values in map order.
   * Entries without a value are ignored.
   * Callers use this for renderable lists.
   */
  public values(): TValue[] {
    return Array.from(this.value?.values() ?? []).flatMap((item) => (item.value === null ? [] : [item.value]));
  }

  /**
   * Returns entries with their current loadable status.
   * Entries without a value are ignored.
   * UI lists use this when row-level pending state matters.
   */
  public entries(): LoadableRegistryItem<TValue>[] {
    return Array.from(this.value?.entries() ?? []).flatMap(([id, item]) =>
      item.value === null ? [] : [{ id, status: item.status, value: item.value }],
    );
  }

  /**
   * Returns all registered keys in map order.
   * Loading entries are included because they still represent tracked work.
   * This is useful for per-item pending state.
   */
  public keys(): string[] {
    return Array.from(this.value?.keys() ?? []);
  }

  private fromLoadable(loadable: Loadable<LoadableRegistryValue<TValue>>) {
    const registry = new LoadableRegistry<TValue>();
    return registry.withLoadable(loadable);
  }

  private withLoadable(loadable: Loadable<LoadableRegistryValue<TValue>>) {
    return Object.assign(this, { loadable });
  }
}
