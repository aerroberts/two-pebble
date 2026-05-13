const METRIC_NAME_PATTERN = /^[a-z]+(\.[a-z]+)*$/;

export class InvalidMetricNameError extends Error {
  public constructor(name: string) {
    super(`Invalid metric name: ${JSON.stringify(name)}. Names must be lowercase letters separated by dots.`);
    this.name = 'InvalidMetricNameError';
  }
}

export function assertValidMetricName(name: string): void {
  if (!METRIC_NAME_PATTERN.test(name)) throw new InvalidMetricNameError(name);
}
