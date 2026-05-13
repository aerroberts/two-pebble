export type TimelineChartStatus = 'default' | 'in-progress' | 'success' | 'failed';

export type TimelineTimeValue = Date | string | number;

export interface TimelineMetric {
  label: string;
  value: string | number;
}

export interface TimelineChartItem {
  id: string;
  label: string;
  startTime: Date | string | number;
  endTime?: Date | string | number;
  href?: string;
  category?: string;
  status?: TimelineChartStatus;
  metrics?: Array<TimelineMetric>;
  color?: string;
}

export interface TimelineChartRangeOption {
  label: string;
  start: TimelineTimeValue;
  stop: TimelineTimeValue;
}

export interface TimelineChartSelectedRange {
  start: number;
  stop: number;
  label?: string;
}

export interface TimelineChartProps {
  items: Array<TimelineChartItem>;
  className?: string;
  height?: number;
  gridIntervalMs?: number;
  emptyMessage?: string;
  showLegend?: boolean;
  showVerticalLines?: boolean;
  rangeOptions?: Array<TimelineChartRangeOption>;
  defaultRangeLabel?: string;
  onItemClick?: (item: TimelineChartItem) => void;
  onRangeSelect?: (range: TimelineChartSelectedRange) => void;
  nowTimestamp?: number;
}

export interface NormalizedItem {
  item: TimelineChartItem;
  startMs: number;
  endMs: number;
}

export interface PlacedItem extends NormalizedItem {
  row: number;
  startPercent: number;
  endPercent: number;
}

export interface TimeTooltipData {
  timeMs: number;
  percent: number;
}

export interface ComputeLayoutInput {
  normalized: Array<NormalizedItem>;
  startMs: number;
  endMs: number;
  totalDurationMs: number;
}

export interface ComputeLayoutResult {
  placed: Array<PlacedItem>;
  rowCount: number;
}

export type HoveredItemId = string | null;
