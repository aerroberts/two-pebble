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

  test('happy: merges ready items by id while preserving untouched entries', () => {
    const emptyRegistry = new LoadableRegistry<{ id: string; label: string }>();
    const current = emptyRegistry.withReadyItems([
      { id: 'one', label: 'alpha' },
      { id: 'two', label: 'beta' },
    ]);
    const next = current.withMergedReadyItems([
      { id: 'two', label: 'beta-updated' },
      { id: 'three', label: 'gamma' },
    ]);
    expect(next.values()).toEqual([
      { id: 'one', label: 'alpha' },
      { id: 'two', label: 'beta-updated' },
      { id: 'three', label: 'gamma' },
    ]);
  });

  test('happy: merge does not drop entries owned by another scope', () => {
    const emptyRegistry = new LoadableRegistry<{ id: string; scope: string }>();
    const scopeA = emptyRegistry.withMergedReadyItems([{ id: 'a1', scope: 'a' }]);
    const scopeB = scopeA.withMergedReadyItems([{ id: 'b1', scope: 'b' }]);
    expect(scopeB.keys()).toEqual(['a1', 'b1']);
  });

  test('happy: merge does not mutate the prior registry', () => {
    const emptyRegistry = new LoadableRegistry<{ id: string }>();
    const current = emptyRegistry.withReadyItems([{ id: 'one' }]);
    const next = current.withMergedReadyItems([{ id: 'two' }]);
    expect(current.keys()).toEqual(['one']);
    expect(next.keys()).toEqual(['one', 'two']);
  });
});
