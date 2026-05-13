import { Metrics } from '../metrics';
import type { MetricEntry } from '../types';

/**
 * Builds a memory-backed metrics reporter for tests.
 *
 * The returned entries array records each emitted metric in order.
 */
export function setupMetrics() {
  const entries: MetricEntry[] = [];
  const metrics = new Metrics();
  metrics.onMetric((entry) => entries.push(entry));
  return { metrics, entries };
}

/**
 * Builds periodic listeners where the first fails and the second records state.
 *
 * Tests use this to verify listener isolation without a long inline fixture.
 */
export function setupPeriodicErrorIsolation() {
  const metrics = new Metrics({ periodicIntervalMs: 60_000 });
  const state = { secondListenerRan: false };
  metrics.periodically(() => {
    throw new Error('boom');
  });
  metrics.periodically(() => {
    state.secondListenerRan = true;
  });
  return { metrics, state };
}
