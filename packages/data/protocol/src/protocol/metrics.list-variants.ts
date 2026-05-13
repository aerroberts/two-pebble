export interface MetricVariant {
  dimensions: Record<string, string>;
  sampleCount: number;
  lastSeenAt: number;
}

export interface MetricsListVariantsOperation {
  name: 'listMetricVariants';
  request: {
    name: string;
  };
  response: {
    items: MetricVariant[];
  };
}
