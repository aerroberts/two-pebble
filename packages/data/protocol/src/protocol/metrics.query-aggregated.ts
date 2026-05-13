export interface MetricAggregateBucket {
  bucketStart: number;
  sampleCount: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
}

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
