import { CHART_COLORS, chartColorToRgba, chartPaletteColor } from '../utils/chart-colors';
import type {
  ComputeLayoutInput,
  ComputeLayoutResult,
  NormalizedItem,
  PlacedItem,
  TimelineChartItem,
  TimelineTimeValue,
} from './types';

export function toEpochMs(value: TimelineTimeValue): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return new Date(value).getTime();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }
  if (minutes > 0) {
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  }
  if (seconds > 0) return `${seconds}s`;
  return `${Math.max(ms, 0)}ms`;
}

export function formatMetricLabel(label: string): string {
  return label
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildColorMap(categories: Array<string>, items: Array<NormalizedItem>): Map<string, string> {
  const colorMap = new Map<string, string>();
  for (const entry of items) {
    if (!entry.item.color) continue;
    const category = entry.item.category ?? entry.item.label;
    if (!colorMap.has(category)) colorMap.set(category, entry.item.color);
  }
  let paletteIndex = 0;
  for (const category of categories) {
    if (colorMap.has(category)) continue;
    colorMap.set(category, chartPaletteColor(paletteIndex));
    paletteIndex += 1;
  }
  return colorMap;
}

export function getBarColor(item: TimelineChartItem, colorMap: Map<string, string>): string {
  if (item.status === 'failed') return chartColorToRgba(CHART_COLORS.red, 0.72);
  if (item.color) return item.color;
  const category = item.category ?? item.label;
  return colorMap.get(category) ?? chartPaletteColor(0);
}

export function computeLayout(input: ComputeLayoutInput): ComputeLayoutResult {
  const { normalized, startMs, endMs, totalDurationMs } = input;
  const sorted = [...normalized].sort((a, b) => a.startMs - b.startMs);
  const rowAllocations: Array<Array<[number, number]>> = [];
  const placed: Array<PlacedItem> = [];

  for (const entry of sorted) {
    const clippedStartMs = Math.max(entry.startMs, startMs);
    const clippedEndMs = Math.min(entry.endMs, endMs);
    if (clippedEndMs <= clippedStartMs) continue;

    const relativeStart = clippedStartMs - startMs;
    const relativeEnd = clippedEndMs - startMs;
    const startPercent = (relativeStart / totalDurationMs) * 100;
    const endPercent = (relativeEnd / totalDurationMs) * 100;

    let row = 0;
    let foundRow = false;

    while (!foundRow) {
      if (!rowAllocations[row]) {
        rowAllocations[row] = [];
      }

      const overlaps = rowAllocations[row].some(
        ([rangeStart, rangeEnd]) => !(endPercent + 0.2 <= rangeStart || startPercent >= rangeEnd + 0.2),
      );

      if (!overlaps) {
        rowAllocations[row].push([startPercent, endPercent]);
        placed.push({ ...entry, row, startPercent, endPercent });
        foundRow = true;
      } else {
        row++;
      }
    }
  }

  return { placed, rowCount: rowAllocations.length };
}
