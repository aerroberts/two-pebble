import { describe, expect, test } from 'bun:test';
import { Events } from './events';

describe('feature: Events', () => {
  test('happy: invokes listeners with typed payloads', () => {
    const events = new Events<{ changed: [number, string]; empty: [] }>();
    const calls: Array<[number, string]> = [];
    events.on('changed', (count, label) => calls.push([count, label]));
    const emitted = events.emit('changed', 3, 'ready');
    expect(emitted).toBe(true);
    expect(calls).toEqual([[3, 'ready']]);
  });

  test('happy: once removes the listener after the first emit', () => {
    const events = new Events<{ changed: [number, string]; empty: [] }>();
    const calls: string[] = [];
    events.once('empty', () => calls.push('called'));
    events.emit('empty');
    events.emit('empty');
    expect(calls).toEqual(['called']);
  });

  test('happy: off makes cleanup idempotent', () => {
    const events = new Events<{ changed: [number, string]; empty: [] }>();
    const calls: number[] = [];
    const listener = (count: number) => calls.push(count);
    events.on('changed', listener);
    events.off('changed', listener);
    events.off('changed', listener);
    const emitted = events.emit('changed', 1, 'ignored');
    expect(emitted).toBe(false);
    expect(calls).toEqual([]);
  });
});
