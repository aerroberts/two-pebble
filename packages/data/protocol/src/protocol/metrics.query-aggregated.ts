/**
 * Defines the MetricAggregateBucket protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MetricAggregateBucket {
  bucketStart: number;
  sampleCount: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
}

/**
 * Defines the MetricsQueryAggregatedOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MetricsQueryAggregatedOperation {
  name: 'queryMetricsAggregated';
  request: {
    name: string;
    fromTimestamp: number;
    toTimestamp: number;
    bucketSizeMs: number;
    dimensions?: Record<string, string>;
  };
  response: {
    buckets: MetricAggregateBucket[];
  };
}
