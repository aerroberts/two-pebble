import { describe, expect, test } from 'bun:test';
import { InvalidMetricNameError } from '../metric-name';
import { Metrics } from '../metrics';
import type { MetricEntry } from '../types';

function setupMetrics() {
  const entries: MetricEntry[] = [];
  const m = new Metrics();
  m.onMetric((e) => entries.push(e));
  return { metrics: m, entries };
}

describe('feature: Metrics.emit', () => {
  test('happy: invokes registered handler synchronously', () => {
    const { metrics, entries } = setupMetrics();
    metrics.emit('foo.bar', 5, { region: 'us' });
    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe('foo.bar');
    expect(entries[0]?.value).toBe(5);
    expect(entries[0]?.dimensions).toEqual({ region: 'us' });
  });

  test('happy: drops emissions when no handler registered', () => {
    const m = new Metrics();
    expect(() => m.emit('foo', 1)).not.toThrow();
  });

  test('happy: swallows handler errors', () => {
    const m = new Metrics();
    m.onMetric(() => {
      throw new Error('sink boom');
    });
    expect(() => m.emit('foo', 1)).not.toThrow();
  });

  test('sad: rejects names with uppercase letters', () => {
    const m = new Metrics();
    expect(() => m.emit('FooBar', 1)).toThrow(InvalidMetricNameError);
  });

  test('sad: rejects names with dashes', () => {
    const m = new Metrics();
    expect(() => m.emit('foo-bar', 1)).toThrow(InvalidMetricNameError);
  });

  test('sad: rejects empty segments', () => {
    const m = new Metrics();
    expect(() => m.emit('foo..bar', 1)).toThrow(InvalidMetricNameError);
    expect(() => m.emit('.foo', 1)).toThrow(InvalidMetricNameError);
    expect(() => m.emit('foo.', 1)).toThrow(InvalidMetricNameError);
  });

  test('sad: drops non-finite values silently', () => {
    const { metrics, entries } = setupMetrics();
    metrics.emit('foo', Number.NaN);
    metrics.emit('foo', Number.POSITIVE_INFINITY);
    expect(entries).toHaveLength(0);
  });
});

describe('feature: Metrics.wrap', () => {
  test('happy: emits duration and success for sync return', () => {
    const { metrics, entries } = setupMetrics();
    const wrapped = metrics.wrap('op.run', (n: number) => n * 2);
    expect(wrapped(3)).toBe(6);
    const names = entries.map((e) => e.name);
    expect(names).toEqual(['op.run.duration', 'op.run.success']);
  });

  test('sad: emits duration and failure for sync throw', () => {
    const { metrics, entries } = setupMetrics();
    const wrapped = metrics.wrap('op.run', () => {
      throw new Error('boom');
    });
    expect(() => wrapped()).toThrow('boom');
    const names = entries.map((e) => e.name);
    expect(names).toEqual(['op.run.duration', 'op.run.failure']);
  });

  test('happy: emits duration and success for async resolve', async () => {
    const { metrics, entries } = setupMetrics();
    const wrapped = metrics.wrap('op.run', async (n: number) => n * 2);
    await expect(wrapped(3)).resolves.toBe(6);
    const names = entries.map((e) => e.name);
    expect(names).toEqual(['op.run.duration', 'op.run.success']);
  });

  test('sad: emits duration and failure for async reject', async () => {
    const { metrics, entries } = setupMetrics();
    const wrapped = metrics.wrap('op.run', async () => {
      throw new Error('boom');
    });
    await expect(wrapped()).rejects.toThrow('boom');
    const names = entries.map((e) => e.name);
    expect(names).toEqual(['op.run.duration', 'op.run.failure']);
  });

  test('happy: forwards dimensions to every emitted metric', async () => {
    const { metrics, entries } = setupMetrics();
    const wrapped = metrics.wrap('op.run', async () => undefined, { tag: 'x' });
    await wrapped();
    expect(entries.every((e) => e.dimensions.tag === 'x')).toBe(true);
  });
});

describe('feature: Metrics.periodically', () => {
  test('happy: fires every registered listener on tick', () => {
    const m = new Metrics({ periodicIntervalMs: 60_000 });
    const calls: string[] = [];
    m.periodically(() => calls.push('a'));
    m.periodically(() => calls.push('b'));
    m.firePeriodicListenersForTesting();
    m.firePeriodicListenersForTesting();
    m.shutdown();
    expect(calls).toEqual(['a', 'b', 'a', 'b']);
  });

  test('happy: an erroring listener does not block siblings', () => {
    const m = new Metrics({ periodicIntervalMs: 60_000 });
    let bRan = false;
    m.periodically(() => {
      throw new Error('boom');
    });
    m.periodically(() => {
      bRan = true;
    });
    m.firePeriodicListenersForTesting();
    m.shutdown();
    expect(bRan).toBe(true);
  });
});
