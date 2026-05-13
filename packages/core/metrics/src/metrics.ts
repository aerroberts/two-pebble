import { assertValidMetricName } from './metric-name';
import type { MetricDimensions, MetricEntry, MetricHandler, MetricPeriodicListener, MetricsInput } from './types';

const DEFAULT_PERIODIC_INTERVAL_MS = 30_000;

/**
 * Process-wide metric reporter.
 *
 * Emission is fire-and-forget: the registered handler is invoked synchronously
 * and any thrown error is swallowed so callers can never be slowed or blocked
 * by a misbehaving sink. Until a handler is registered, metrics are dropped.
 */
export class Metrics {
  private readonly periodicIntervalMs: number;
  private handler: MetricHandler | undefined;
  private periodicListeners: MetricPeriodicListener[] = [];
  private periodicTimer: ReturnType<typeof setInterval> | undefined;

  public constructor(input: MetricsInput = {}) {
    this.periodicIntervalMs = input.periodicIntervalMs ?? DEFAULT_PERIODIC_INTERVAL_MS;
  }

  /**
   * Registers (or replaces) the handler that consumes emitted metrics.
   *
   * Daemon boot calls this once with a sink that writes to the datastore.
   * Test setups may pass a memory-backed handler instead.
   */
  public onMetric(handler: MetricHandler): void {
    this.handler = handler;
  }

  /**
   * Emits a single metric.
   *
   * Returns immediately. The registered handler runs synchronously; any error
   * it throws is swallowed so the caller is never blocked or surfaced an issue
   * caused by the sink.
   */
  public emit(name: string, value: number, dimensions: MetricDimensions = {}): void {
    assertValidMetricName(name);
    if (!Number.isFinite(value)) return;
    if (this.handler === undefined) return;
    const entry: MetricEntry = { name, value, dimensions, timestamp: Date.now() };
    try {
      this.handler(entry);
    } catch {
      // Swallowed — emission is fire-and-forget and must never bubble up.
    }
  }

  /**
   * Wraps a function so calling it emits duration, success, and failure metrics.
   *
   * The wrapper preserves the original signature. If the wrapped function
   * returns a thenable, success/failure are reported when it settles; otherwise
   * they are reported synchronously around the return.
   */
  public wrap<Args extends unknown[], Result>(
    name: string,
    fn: (...args: Args) => Result,
    dimensions: MetricDimensions = {},
  ): (...args: Args) => Result {
    assertValidMetricName(name);
    const durationName = `${name}.duration`;
    const successName = `${name}.success`;
    const failureName = `${name}.failure`;
    return (...args: Args): Result => {
      const startedAt = performance.now();
      const reportSuccess = () => {
        this.emit(durationName, performance.now() - startedAt, dimensions);
        this.emit(successName, 1, dimensions);
      };
      const reportFailure = () => {
        this.emit(durationName, performance.now() - startedAt, dimensions);
        this.emit(failureName, 1, dimensions);
      };
      try {
        const result = fn(...args);
        if (isThenable(result)) {
          return result.then(
            (resolved) => {
              reportSuccess();
              return resolved;
            },
            (error: unknown) => {
              reportFailure();
              throw error;
            },
          ) as Result;
        }
        reportSuccess();
        return result;
      } catch (error) {
        reportFailure();
        throw error;
      }
    };
  }

  /**
   * Registers a periodic snapshot listener.
   *
   * Every interval tick fires every registered listener in registration order.
   * Listeners typically call `metrics.emit` with current snapshot values.
   * The shared timer is started lazily when the first listener registers.
   */
  public periodically(listener: MetricPeriodicListener): void {
    this.periodicListeners.push(listener);
    if (this.periodicTimer === undefined) {
      this.periodicTimer = setInterval(() => this.firePeriodicListeners(), this.periodicIntervalMs);
    }
  }

  /**
   * Stops the shared periodic timer and clears registered listeners.
   *
   * Tests should call this in teardown so the interval does not keep the
   * process alive beyond the test suite. The metric handler is also cleared
   * so emissions during downstream shutdown are dropped rather than racing
   * against the closing sink.
   */
  public shutdown(): void {
    if (this.periodicTimer !== undefined) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = undefined;
    }
    this.periodicListeners = [];
    this.handler = undefined;
  }

  /**
   * Fires every registered periodic listener once.
   *
   * Exposed for tests so they can deterministically tick periodic emission
   * without relying on real timers.
   */
  public firePeriodicListenersForTesting(): void {
    this.firePeriodicListeners();
  }

  private firePeriodicListeners(): void {
    for (const listener of this.periodicListeners) {
      try {
        listener();
      } catch {
        // Swallowed — a faulty listener must not block sibling listeners.
      }
    }
  }
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return value !== null && typeof value === 'object' && typeof (value as { then?: unknown }).then === 'function';
}
