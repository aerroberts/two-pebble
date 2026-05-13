import { CHART_COLORS, CHART_PALETTE, type ChartColorName } from '../utils/chart-colors';
import type {
  BuildChartStateInput,
  ChartState,
  ChartTimestamp,
  LineChartSeries,
  NormalizedPoint,
  OptionalColor,
  TickItem,
  TimestampFormatter,
  ValueFormatter,
  XTickItem,
} from './types';

export function toEpochMs(value: ChartTimestamp): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }
  return new Date(value).getTime();
}

export function defaultValueFormatter(value: number): string {
  if (value === 0) {
    return '0';
  }
  if (Math.abs(value) < 0.01) {
    return value.toFixed(4);
  }
  if (Math.abs(value) < 1) {
    return value.toFixed(3);
  }
  if (Math.abs(value) < 1000) {
    return value.toFixed(2);
  }
  return value.toLocaleString();
}

export function defaultTimestampFormatter(ms: number): string {
  const date = new Date(ms);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function resolveSeriesColor(color: OptionalColor, index: number): string {
  // Lines use the chart palette at full opacity — alpha would wash out a 1.5px
  // stroke. Filled areas under the line apply opacity through fillOpacity
  // instead of pre-mixing it into the stroke color.
  if (!color) {
    return CHART_PALETTE[index % CHART_PALETTE.length] ?? 'currentColor';
  }
  if (color in CHART_COLORS) {
    return CHART_COLORS[color as ChartColorName];
  }
  return color;
}

function getNiceCeiling(value: number): number {
  if (value <= 0) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const normalized = value / magnitude;
  if (normalized <= 1) {
    return magnitude;
  }
  if (normalized <= 2) {
    return 2 * magnitude;
  }
  if (normalized <= 5) {
    return 5 * magnitude;
  }
  return 10 * magnitude;
}

function buildInferredSeries(seriesIds: Array<string>): Array<LineChartSeries> {
  return seriesIds.map((seriesId) => ({ id: seriesId, label: seriesId }));
}

function getUniqueSeriesIds(seriesIds: Array<string>, knownSeriesIds: Set<string>): Array<string> {
  return seriesIds.filter(
    (seriesId, index, values) => values.indexOf(seriesId) === index && !knownSeriesIds.has(seriesId),
  );
}

export function buildChartState(input: BuildChartStateInput): ChartState {
  const normalizedPoints: NormalizedPoint[] = input.points
    .map((point) => {
      const timestamp = toEpochMs(point.timestamp);
      if (Number.isNaN(timestamp) || Number.isNaN(point.value)) {
        return null;
      }
      return { seriesId: point.seriesId, timestamp, value: point.value };
    })
    .filter((point): point is NormalizedPoint => point !== null);

  const providedSeries = input.series ?? [];
  const knownSeriesIds = new Set(providedSeries.map((item) => item.id));
  const inferredSeries = buildInferredSeries(
    getUniqueSeriesIds(
      normalizedPoints.map((point) => point.seriesId),
      knownSeriesIds,
    ),
  );
  const resolvedSeries = [...providedSeries, ...inferredSeries];
  const paletteBySeries = new Map<string, string>();
  resolvedSeries.forEach((item, index) => {
    paletteBySeries.set(item.id, resolveSeriesColor(item.color, index));
  });

  if (normalizedPoints.length === 0 || resolvedSeries.length === 0) {
    return {
      chartStartMs: 0,
      chartEndMs: 1,
      pointsBySeries: new Map(),
      paletteBySeries,
      resolvedSeries,
      yAxisMin: 0,
      yAxisMax: 1,
    };
  }

  const dataStart = Math.min(...normalizedPoints.map((point) => point.timestamp));
  const dataEnd = Math.max(...normalizedPoints.map((point) => point.timestamp));
  const explicitStart = input.startTime === undefined ? dataStart : toEpochMs(input.startTime);
  const explicitEnd = input.endTime === undefined ? dataEnd : toEpochMs(input.endTime);
  const chartStartMs = Math.min(explicitStart, dataStart);
  const chartEndMs = Math.max(Math.max(explicitEnd, dataEnd), chartStartMs + 1);

  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  for (const point of normalizedPoints) {
    if (point.value < yMin) {
      yMin = point.value;
    }
    if (point.value > yMax) {
      yMax = point.value;
    }
  }
  // Floor at zero when every observation is non-negative; this keeps gauges and
  // counters anchored to a familiar baseline instead of zooming into noise.
  if (yMin >= 0) {
    yMin = 0;
  }
  if (yMin === yMax) {
    yMax = yMin + 1;
  }
  const yAxisMax = yMin >= 0 ? getNiceCeiling(yMax) : yMax + (yMax - yMin) * 0.1;
  const yAxisMin = yMin >= 0 ? 0 : yMin - (yMax - yMin) * 0.1;

  const pointsBySeries = new Map<string, Array<{ x: number; y: number }>>();
  for (const series of resolvedSeries) {
    pointsBySeries.set(series.id, []);
  }
  const sorted = [...normalizedPoints].sort((a, b) => a.timestamp - b.timestamp);
  for (const point of sorted) {
    const bucket = pointsBySeries.get(point.seriesId);
    if (bucket === undefined) {
      continue;
    }
    bucket.push({ x: point.timestamp, y: point.value });
  }

  return {
    chartStartMs,
    chartEndMs,
    pointsBySeries,
    paletteBySeries,
    resolvedSeries,
    yAxisMin,
    yAxisMax,
  };
}

export function getYTickItems(yMin: number, yMax: number, count: number): Array<TickItem> {
  const tickCount = Math.max(2, count);
  return Array.from({ length: tickCount }, (_, index) => {
    const ratio = (tickCount - 1 - index) / (tickCount - 1);
    const value = yMin + (yMax - yMin) * ratio;
    return {
      key: `tick-${index}-${yMax}`,
      topPercent: (index / (tickCount - 1)) * 100,
      value,
    };
  });
}

export function getXTickItems(startMs: number, endMs: number, count: number): Array<XTickItem> {
  const tickCount = Math.max(2, count);
  const range = Math.max(1, endMs - startMs);
  return Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1);
    const timestampMs = startMs + range * ratio;
    return {
      key: `xtick-${index}-${timestampMs}`,
      leftPercent: ratio * 100,
      timestampMs,
    };
  });
}

export function buildSvgPath(
  points: Array<{ x: number; y: number }>,
  startMs: number,
  endMs: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
): string {
  if (points.length === 0) {
    return '';
  }
  const xRange = Math.max(1, endMs - startMs);
  const yRange = Math.max(Number.MIN_VALUE, yMax - yMin);
  return points
    .map((point, index) => {
      const x = ((point.x - startMs) / xRange) * width;
      const y = (1 - (point.y - yMin) / yRange) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function buildAreaPath(
  points: Array<{ x: number; y: number }>,
  startMs: number,
  endMs: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
): string {
  if (points.length === 0) {
    return '';
  }
  const line = buildSvgPath(points, startMs, endMs, yMin, yMax, width, height);
  const xRange = Math.max(1, endMs - startMs);
  const last = points.at(-1);
  const first = points.at(0);
  if (last === undefined || first === undefined) {
    return '';
  }
  const lastX = ((last.x - startMs) / xRange) * width;
  const firstX = ((first.x - startMs) / xRange) * width;
  return `${line} L${lastX.toFixed(2)},${height.toFixed(2)} L${firstX.toFixed(2)},${height.toFixed(2)} Z`;
}

export type { TimestampFormatter, ValueFormatter };
export { defaultValueFormatter as defaultLineChartValueFormatter };
