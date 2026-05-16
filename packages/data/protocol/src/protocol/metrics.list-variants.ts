/**
 * Defines the MetricVariant protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MetricVariant {
  dimensions: Record<string, string>;
  sampleCount: number;
  lastSeenAt: number;
}

/**
 * Defines the MetricsListVariantsOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MetricsListVariantsOperation {
  name: 'listMetricVariants';
  request: {
    name: string;
  };
  response: {
    items: MetricVariant[];
  };
}
