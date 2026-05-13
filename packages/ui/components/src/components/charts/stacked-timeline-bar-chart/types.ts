export type ChartTimestamp = Date | string | number;
export type ValueFormatter = (value: number) => string;
export type OptionalColor = string | undefined;

export interface StackedTimelineBarChartSeries {
  id: string;
  label: string;
  color?: string;
}

export interface StackedTimelineBarChartPoint {
  timestamp: ChartTimestamp;
  seriesId: string;
  value: number;
}

export interface StackedTimelineBarChartProps {
  points: Array<StackedTimelineBarChartPoint>;
  series?: Array<StackedTimelineBarChartSeries>;
  startTime?: ChartTimestamp;
  endTime?: ChartTimestamp;
  bucketCount?: number;
  valueFormatter?: ValueFormatter;
  yAxisWidth?: number;
  yAxisTickCount?: number;
  height?: number;
  className?: string;
  emptyMessage?: string;
}

export interface BucketRow {
  key: string;
  startMs: number;
  endMs: number;
  bySeries: Record<string, number>;
  total: number;
}

export interface ChartState {
  buckets: Array<BucketRow>;
  chartStartMs: number;
  paletteBySeries: Map<string, string>;
  resolvedSeries: Array<StackedTimelineBarChartSeries>;
  yAxisMax: number;
}

export interface TickItem {
  key: string;
  topPercent: number;
  value: number;
}

export interface TooltipRow {
  label: string;
  value: string;
}

export interface BuildChartStateInput {
  bucketCount?: number;
  endTime?: ChartTimestamp;
  points: Array<StackedTimelineBarChartPoint>;
  series?: Array<StackedTimelineBarChartSeries>;
  startTime?: ChartTimestamp;
}
