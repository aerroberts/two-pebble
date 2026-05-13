export type MetricDimensions = Record<string, string>;

export interface MetricEntry {
  name: string;
  value: number;
  dimensions: MetricDimensions;
  timestamp: number;
}

export type MetricHandler = (entry: MetricEntry) => void;

export type MetricPeriodicListener = () => void;

export interface MetricsInput {
  periodicIntervalMs?: number;
}
