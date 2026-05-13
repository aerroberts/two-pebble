import { InvalidMetricNameError } from './invalid-metric-name-error';

/**
 * Enforces the metric naming contract.
 *
 * Names are lowercase dot-separated segments like `agent.run.duration`.
 */
export function assertValidMetricName(name: string): void {
  if (!/^[a-z]+(\.[a-z]+)*$/.test(name)) {
    throw new InvalidMetricNameError(name);
  }
}
