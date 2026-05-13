export interface MetricNameSummary {
  name: string;
  sampleCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

export interface MetricsListNamesOperation {
  name: 'listMetricNames';
  request: Record<string, never>;
  response: {
    items: MetricNameSummary[];
  };
}
