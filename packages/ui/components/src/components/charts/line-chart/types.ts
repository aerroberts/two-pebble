export type ChartTimestamp = Date | string | number;
export type ValueFormatter = (value: number) => string;
export type TimestampFormatter = (ms: number) => string;
export type OptionalColor = string | undefined;

export interface LineChartSeries {
  id: string;
  label: string;
  color?: string;
}

export interface LineChartPoint {
  timestamp: ChartTimestamp;
  seriesId: string;
  value: number;
}

export interface LineChartProps {
  points: Array<LineChartPoint>;
  series?: Array<LineChartSeries>;
  startTime?: ChartTimestamp;
  endTime?: ChartTimestamp;
  height?: number;
  yAxisWidth?: number;
  yAxisTickCount?: number;
  xAxisTickCount?: number;
  valueFormatter?: ValueFormatter;
  timestampFormatter?: TimestampFormatter;
  showLegend?: boolean;
  showDots?: boolean;
  filledArea?: boolean;
  className?: string;
  emptyMessage?: string;
}

export interface NormalizedPoint {
  seriesId: string;
  timestamp: number;
  value: number;
}

export interface ChartState {
  chartStartMs: number;
  chartEndMs: number;
  pointsBySeries: Map<string, Array<{ x: number; y: number }>>;
  paletteBySeries: Map<string, string>;
  resolvedSeries: Array<LineChartSeries>;
  yAxisMin: number;
  yAxisMax: number;
}

export interface TickItem {
  key: string;
  topPercent: number;
  value: number;
}

export interface XTickItem {
  key: string;
  leftPercent: number;
  timestampMs: number;
}

export interface BuildChartStateInput {
  endTime?: ChartTimestamp;
  points: Array<LineChartPoint>;
  series?: Array<LineChartSeries>;
  startTime?: ChartTimestamp;
}
