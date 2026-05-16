/**
 * Defines the MetricNameSummary protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MetricNameSummary {
  name: string;
  sampleCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

/**
 * Defines the MetricsListNamesOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MetricsListNamesOperation {
  name: 'listMetricNames';
  request: Record<string, never>;
  response: {
    items: MetricNameSummary[];
  };
}
