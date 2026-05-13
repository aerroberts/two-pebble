/**
 * Tags attached to a metric emission.
 *
 * Dimension values are strings so sinks can group and filter consistently.
 */
export type MetricDimensions = Record<string, string>;

/**
 * A single metric emission.
 *
 * Metric entries are produced by `Metrics.emit` and consumed by sinks.
 */
export interface MetricEntry {
  name: string;
  value: number;
  dimensions: MetricDimensions;
  timestamp: number;
}

/**
 * Sink callback for metric emissions.
 *
 * Handlers are called synchronously and should avoid slow work.
 */
export type MetricHandler = (entry: MetricEntry) => void;

/**
 * Listener used for periodic snapshot emission.
 *
 * Listeners usually call `Metrics.emit` with current state.
 */
export type MetricPeriodicListener = () => void;

/**
 * Timer handle returned by periodic metric scheduling.
 *
 * The alias keeps implementation fields simple and named.
 */
export type MetricPeriodicTimer = ReturnType<typeof setInterval>;

/**
 * Configuration for a metrics reporter.
 *
 * Tests can shorten the periodic interval while production uses the default.
 */
export interface MetricsInput {
  periodicIntervalMs?: number;
}

/**
 * Constructor arguments for a metrics reporter.
 *
 * The tuple keeps optional construction explicit without optional parameters.
 */
export type MetricsConstructorArguments = [] | [MetricsInput];

/**
 * Optional dimension argument for metric emission.
 *
 * The tuple supports `emit(name, value)` and `emit(name, value, dimensions)`.
 */
export type MetricEmitDimensions = [] | [MetricDimensions];

/**
 * Supported argument value for a wrapped metric function.
 *
 * The type keeps wrapped call signatures out of escape-hatch territory.
 */
export type MetricArgument = boolean | null | number | object | string | undefined;

/**
 * Argument list accepted by a wrapped metric function.
 *
 * The list preserves the wrapped function call signature.
 */
export type MetricArguments = MetricArgument[];

/**
 * Optional dimension argument for wrapped functions.
 *
 * The tuple supports wrapping with or without static dimensions.
 */
export type MetricWrapDimensions = [] | [MetricDimensions];

/**
 * Function signature produced and consumed by `Metrics.wrap`.
 *
 * The wrapper preserves argument and return types.
 */
export type MetricWrappedFunction<TArgs extends MetricArguments, TResult> = (...args: TArgs) => TResult;

/**
 * Promise observation input for wrapped async functions.
 *
 * Grouping the data keeps the private observation signature narrow.
 */
export interface MetricPromiseObservation<TResult> {
  name: string;
  startedAt: number;
  dimensions: MetricDimensions;
  result: Promise<TResult>;
}
