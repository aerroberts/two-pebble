import { CHART_COLORS, type ChartColorName, chartPaletteColor, chartSeriesColor } from '../utils/chart-colors';
import type {
  BucketRow,
  BuildChartStateInput,
  ChartState,
  ChartTimestamp,
  OptionalColor,
  StackedTimelineBarChartSeries,
  TickItem,
  TooltipRow,
  ValueFormatter,
} from './types';

export function toEpochMs(value: ChartTimestamp) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  return new Date(value).getTime();
}

export function formatElapsed(ms: number) {
  if (ms < 1000) {
    return `${Math.max(0, Math.round(ms))}ms`;
  }

  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function defaultValueFormatter(value: number) {
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

export function resolveSeriesColor(color: OptionalColor, index: number) {
  if (!color) {
    return chartPaletteColor(index);
  }

  if (color in CHART_COLORS) {
    return chartSeriesColor(CHART_COLORS[color as ChartColorName]);
  }

  return color;
}

function getNiceCeiling(value: number) {
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

function buildInferredSeries(seriesIds: Array<string>) {
  return seriesIds.map((seriesId) => ({
    id: seriesId,
    label: seriesId,
  })) as Array<StackedTimelineBarChartSeries>;
}

function getUniqueSeriesIds(seriesIds: Array<string>, knownSeriesIds: Set<string>) {
  return seriesIds.filter(
    (seriesId, index, values) => values.indexOf(seriesId) === index && !knownSeriesIds.has(seriesId),
  );
}

interface CreateBucketRowInput {
  bucketSizeMs: number;
  chartStartMs: number;
  index: number;
  resolvedSeries: Array<StackedTimelineBarChartSeries>;
}

function createBucketRow(input: CreateBucketRowInput) {
  const bySeries = Object.fromEntries(input.resolvedSeries.map((item) => [item.id, 0])) as Record<string, number>;
  const startMs = input.chartStartMs + input.index * input.bucketSizeMs;
  const endMs = startMs + input.bucketSizeMs;
  const bucket: BucketRow = {
    bySeries,
    endMs,
    key: `${startMs}-${endMs}`,
    startMs,
    total: 0,
  };

  return bucket;
}

export function buildChartState(input: BuildChartStateInput) {
  const normalizedPoints = input.points
    .map((point) => {
      const timestamp = toEpochMs(point.timestamp);
      if (Number.isNaN(timestamp) || Number.isNaN(point.value)) {
        return null;
      }

      return {
        seriesId: point.seriesId,
        timestamp,
        value: point.value,
      };
    })
    .filter((point): point is { seriesId: string; timestamp: number; value: number } => point !== null);

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
    const emptyState: ChartState = {
      buckets: [],
      chartStartMs: 0,
      paletteBySeries,
      resolvedSeries,
      yAxisMax: 1,
    };

    return emptyState;
  }

  const dataStart = Math.min(...normalizedPoints.map((point) => point.timestamp));
  const dataEnd = Math.max(...normalizedPoints.map((point) => point.timestamp));
  const explicitStart = input.startTime === undefined ? dataStart : toEpochMs(input.startTime);
  const explicitEnd = input.endTime === undefined ? dataEnd : toEpochMs(input.endTime);
  const chartStartMs = Math.min(explicitStart, dataStart);
  const chartEndMs = Math.max(Math.max(explicitEnd, dataEnd), chartStartMs + 1);
  const resolvedBucketCount = Math.max(1, input.bucketCount ?? 12);
  const bucketSizeMs = Math.max(1, Math.ceil((chartEndMs - chartStartMs) / resolvedBucketCount));
  const buckets = Array.from({ length: resolvedBucketCount }, (_, index) =>
    createBucketRow({
      bucketSizeMs,
      chartStartMs,
      index,
      resolvedSeries,
    }),
  );

  for (const point of normalizedPoints) {
    if (point.timestamp < chartStartMs || point.timestamp > chartEndMs) {
      continue;
    }

    const bucketIndex = Math.min(buckets.length - 1, Math.floor((point.timestamp - chartStartMs) / bucketSizeMs));
    buckets[bucketIndex].bySeries[point.seriesId] += point.value;
    buckets[bucketIndex].total += point.value;
  }

  const state: ChartState = {
    buckets,
    chartStartMs,
    paletteBySeries,
    resolvedSeries,
    yAxisMax: getNiceCeiling(buckets.reduce((max, bucket) => Math.max(max, bucket.total), 0)),
  };

  return state;
}

export function buildDisplayBuckets(buckets: Array<BucketRow>, enabledSeries: Array<StackedTimelineBarChartSeries>) {
  return buckets.map((bucket) => {
    const bySeries: Record<string, number> = {};
    let total = 0;

    for (const item of enabledSeries) {
      const value = bucket.bySeries[item.id] ?? 0;
      bySeries[item.id] = value;
      total += value;
    }

    return { ...bucket, bySeries, total };
  });
}

export function getTickItems(yAxisMax: number, yAxisTickCount: number) {
  const count = Math.max(2, yAxisTickCount);

  return Array.from({ length: count }, (_, index) => {
    const ratio = (count - 1 - index) / (count - 1);
    const tick: TickItem = {
      key: `tick-${index}-${yAxisMax}`,
      topPercent: (index / (count - 1)) * 100,
      value: yAxisMax * ratio,
    };

    return tick;
  });
}

export function getTooltipRows(
  bucket: BucketRow,
  enabledSeries: Array<StackedTimelineBarChartSeries>,
  valueFormatter: ValueFormatter,
) {
  return enabledSeries
    .map((item) => ({
      label: item.label,
      numericValue: bucket.bySeries[item.id] ?? 0,
    }))
    .filter((item) => item.numericValue > 0)
    .map((item) => {
      const row: TooltipRow = {
        label: item.label,
        value: valueFormatter(item.numericValue),
      };

      return row;
    });
}
