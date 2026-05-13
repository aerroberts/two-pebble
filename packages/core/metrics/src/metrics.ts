import { DEFAULT_PERIODIC_INTERVAL_MS } from './constants';
import { assertValidMetricName } from './metric-name';
import type {
  MetricArguments,
  MetricDimensions,
  MetricEmitDimensions,
  MetricEntry,
  MetricHandler,
  MetricPeriodicListener,
  MetricPeriodicTimer,
  MetricPromiseObservation,
  MetricsConstructorArguments,
  MetricsInput,
  MetricWrapDimensions,
  MetricWrappedFunction,
} from './types';

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
  private periodicTimer: MetricPeriodicTimer | undefined;

  public constructor(...input: MetricsConstructorArguments) {
    const config: MetricsInput = input[0] ?? {};
    this.periodicIntervalMs = config.periodicIntervalMs ?? DEFAULT_PERIODIC_INTERVAL_MS;
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
  public emit(name: string, value: number, ...input: MetricEmitDimensions): void {
    assertValidMetricName(name);
    if (!Number.isFinite(value)) return;
    if (this.handler === undefined) return;
    const entry: MetricEntry = { name, value, dimensions: input[0] ?? {}, timestamp: Date.now() };
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
  public wrap<Args extends MetricArguments, Result>(
    name: string,
    fn: MetricWrappedFunction<Args, Result>,
    ...input: MetricWrapDimensions
  ): MetricWrappedFunction<Args, Result> {
    assertValidMetricName(name);
    const metricDimensions = input[0] ?? {};
    return (...args: Args): Result => {
      const startedAt = performance.now();
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return this.observePromise({ name, startedAt, dimensions: metricDimensions, result }) as Result;
        }
        this.emitSuccess(name, startedAt, metricDimensions);
        return result;
      } catch (error) {
        this.emitFailure(name, startedAt, metricDimensions);
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

  /**
   * Records successful wrapped execution.
   *
   * Duration and success counters are emitted together for consistent sinks.
   */
  private emitSuccess(name: string, startedAt: number, dimensions: MetricDimensions): void {
    this.emit(`${name}.duration`, performance.now() - startedAt, dimensions);
    this.emit(`${name}.success`, 1, dimensions);
  }

  /**
   * Records failed wrapped execution.
   *
   * Duration and failure counters are emitted together for consistent sinks.
   */
  private emitFailure(name: string, startedAt: number, dimensions: MetricDimensions): void {
    this.emit(`${name}.duration`, performance.now() - startedAt, dimensions);
    this.emit(`${name}.failure`, 1, dimensions);
  }

  /**
   * Observes a wrapped promise and emits metrics after it settles.
   *
   * The original promise value or rejection is preserved.
   */
  private observePromise<Result>(input: MetricPromiseObservation<Result>): Promise<Result> {
    const { name, startedAt, dimensions, result } = input;
    return result.then(
      (resolved) => {
        this.emitSuccess(name, startedAt, dimensions);
        return resolved;
      },
      (error) => {
        this.emitFailure(name, startedAt, dimensions);
        throw error;
      },
    );
  }
}
