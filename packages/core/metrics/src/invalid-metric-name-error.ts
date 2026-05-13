/**
 * Error thrown when a metric name violates the repository naming contract.
 *
 * Metric names must be lowercase dot-separated segments.
 */
export class InvalidMetricNameError extends Error {
  public constructor(name: string) {
    super(`Invalid metric name: ${JSON.stringify(name)}. Names must be lowercase letters separated by dots.`);
    this.name = 'InvalidMetricNameError';
  }
}
