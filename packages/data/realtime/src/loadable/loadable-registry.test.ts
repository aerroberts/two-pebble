import { describe, expect, test } from 'bun:test';
import { LoadableRegistry } from './loadable-registry';

describe('feature: loadable registry state', () => {
  test('happy: returns a new registry when collection status changes', () => {
    const emptyRegistry = new LoadableRegistry<string>();
    const next = emptyRegistry.withStatus('loading');
    expect(next).not.toBe(emptyRegistry);
    expect(next.status).toBe('loading');
  });

  test('happy: tracks entry status separately from collection status', () => {
    const emptyRegistry = new LoadableRegistry<string>();
    const next = emptyRegistry.withItem('one', 'alpha', 'loading');
    expect(next.getItem('one')?.status).toBe('loading');
  });

  test('happy: replaces all items from a list refresh', () => {
    const emptyRegistry = new LoadableRegistry<string>();
    const next = emptyRegistry.withItems([{ id: 'one', status: 'ready', value: 'alpha' }]);
    expect(next.values()).toEqual(['alpha']);
  });

  test('happy: deletes one item without mutating the prior registry', () => {
    const emptyRegistry = new LoadableRegistry<string>();
    const current = emptyRegistry.withItem('one', 'alpha', 'ready');
    const next = current.withoutItem('one');
    expect(current.keys()).toEqual(['one']);
    expect(next.keys()).toEqual([]);
  });
});
