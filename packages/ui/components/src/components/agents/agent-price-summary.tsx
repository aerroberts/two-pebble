'use client';

import { useMemo } from 'react';

import { ProviderLogo } from '../branding/provider-logo/provider-logo';
import {
  ProportionalBarChart,
  type ProportionalBarChartItem,
} from '../charts/proportional-bar-chart/proportional-bar-chart';
import { StackedTimelineBarChart } from '../charts/stacked-timeline-bar-chart/stacked-timeline-bar-chart';
import type {
  StackedTimelineBarChartPoint,
  StackedTimelineBarChartSeries,
} from '../charts/stacked-timeline-bar-chart/types';
import { chartPaletteColor } from '../charts/utils/chart-colors';
import { Icon } from '../content/icon/icon';
import { Table, type TableColumn } from '../data/table/table';

export type PriceChartMode = 'price' | 'quantity';

export interface AgentPriceSummaryLineItem {
  id: string;
  provider: string;
  modelId: string;
  modelVariantId?: string;
  charge: string;
  inferenceProfileId?: string;
  integrationId?: string;
  price: number;
  quantity: number;
  timestamp?: number;
  total: number;
}

export interface AgentPriceSummaryProps {
  chartMode: PriceChartMode;
  lineItems: AgentPriceSummaryLineItem[];
  startTime?: number;
  endTime?: number;
}

export type PriceLineItemListMode = 'all' | 'aggregate';

export interface AgentPriceLineItemListProps {
  lineItems: AgentPriceSummaryLineItem[];
  mode?: PriceLineItemListMode;
}

export interface AgentPriceTotalProps {
  lineItems: AgentPriceSummaryLineItem[];
}

export function AgentPriceTotal(props: AgentPriceTotalProps) {
  const total = props.lineItems.reduce((sum, item) => sum + item.total, 0);
  const colorMap = useMemo(() => buildSeriesColorMap(props.lineItems), [props.lineItems]);
  const items = useMemo(() => buildPriceTotalItems(props.lineItems, colorMap), [colorMap, props.lineItems]);

  return (
    <div className="space-y-3">
      <div className="text-2xl font-medium tabular-nums text-content">{formatUsd(total)}</div>
      <ProportionalBarChart height={10} items={items} valueFormatter={formatUsd} />
    </div>
  );
}

export function AgentPriceSummary(props: AgentPriceSummaryProps) {
  const colorMap = useMemo(() => buildSeriesColorMap(props.lineItems), [props.lineItems]);
  const chartData = useMemo(
    () => buildPriceChartData(props.lineItems, props.chartMode, colorMap),
    [props.chartMode, colorMap, props.lineItems],
  );

  return (
    <div className="space-y-3">
      <StackedTimelineBarChart
        bucketCount={Math.min(16, Math.max(4, props.lineItems.length))}
        className="pt-1"
        emptyMessage="No price timeline data."
        endTime={props.endTime}
        height={190}
        points={chartData.points}
        series={chartData.series}
        startTime={props.startTime}
        valueFormatter={props.chartMode === 'price' ? formatUsd : formatQuantity}
        yAxisWidth={52}
      />
    </div>
  );
}

export function AgentPriceLineItemList(props: AgentPriceLineItemListProps) {
  const mode = props.mode ?? 'all';
  const rows = useMemo(
    () => (mode === 'aggregate' ? aggregatePriceLineItems(props.lineItems) : props.lineItems),
    [mode, props.lineItems],
  );
  return <Table columns={priceLineItemColumns} rows={rows} getRowKey={getPriceLineItemRowKey} />;
}

export const priceLineItemListModeOptions = [
  { value: 'all', label: 'All' },
  { value: 'aggregate', label: 'Aggregate' },
];

interface ProviderMarkProps {
  provider: string;
}

function ProviderMark(props: ProviderMarkProps) {
  if (knownLogoProviders.has(props.provider)) {
    return <ProviderLogo provider={props.provider} size="sm" />;
  }

  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-alt text-content-muted">
      <Icon name="server" color="text-current" />
    </div>
  );
}

interface PriceChartData {
  points: StackedTimelineBarChartPoint[];
  series: StackedTimelineBarChartSeries[];
}

function priceLineItemSeriesId(item: AgentPriceSummaryLineItem): string {
  const variant = item.modelVariantId === undefined ? '' : `:${item.modelVariantId}`;
  return `${item.provider}/${item.modelId}${variant}/${item.charge}`;
}

function buildPriceChartData(
  lineItems: AgentPriceSummaryLineItem[],
  mode: PriceChartMode,
  colorMap: Map<string, string>,
): PriceChartData {
  const series = buildPriceChartSeries(lineItems, colorMap);
  const startTimestamp = Math.min(...lineItems.map((item) => item.timestamp ?? Number.POSITIVE_INFINITY));
  const fallbackStart = Number.isFinite(startTimestamp) ? startTimestamp : 0;
  // Pass raw values through; the bucket aggregator inside the timeline sums
  // them per bucket. Rounding individual entries to 2dp here was the bug —
  // sub-penny charges (typical for per-token rates) round to zero and the
  // chart loses every series except the biggest accumulator.
  const points = lineItems.map((item, index) => ({
    seriesId: priceLineItemSeriesId(item),
    timestamp: item.timestamp ?? fallbackStart + index,
    value: mode === 'price' ? item.total : item.quantity,
  }));

  return { points, series };
}

function buildPriceChartSeries(
  lineItems: AgentPriceSummaryLineItem[],
  colorMap: Map<string, string>,
): StackedTimelineBarChartSeries[] {
  const ids = Array.from(new Set(lineItems.map((item) => priceLineItemSeriesId(item))));
  return ids.map((id) => ({
    color: colorMap.get(id) ?? chartPaletteColor(0),
    id,
    label: id,
  }));
}

/**
 * Computes a stable color per series id so both the proportional total bar
 * and the timeline stack render the same charge in the same color. The
 * mapping is keyed on total spend descending — the heaviest charge always
 * gets palette index 0 — and zero-total series are sorted to the end so
 * they don't burn an early palette slot.
 */
function buildSeriesColorMap(lineItems: AgentPriceSummaryLineItem[]): Map<string, string> {
  const totalsById = new Map<string, number>();
  for (const item of lineItems) {
    const id = priceLineItemSeriesId(item);
    totalsById.set(id, (totalsById.get(id) ?? 0) + item.total);
  }
  const ordered = Array.from(totalsById.entries()).sort((a, b) => b[1] - a[1]);
  const map = new Map<string, string>();
  ordered.forEach(([id], index) => {
    map.set(id, chartPaletteColor(index));
  });
  return map;
}

function buildPriceTotalItems(
  lineItems: AgentPriceSummaryLineItem[],
  colorMap: Map<string, string>,
): ProportionalBarChartItem[] {
  const totalsById = new Map<string, number>();
  for (const item of lineItems) {
    const id = priceLineItemSeriesId(item);
    totalsById.set(id, (totalsById.get(id) ?? 0) + item.total);
  }

  return Array.from(totalsById.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      color: colorMap.get(label) ?? chartPaletteColor(0),
      label,
      value,
    }));
}

/**
 * Collapses every line item with the same series id into a single row,
 * summing quantity and total. The rate-per-unit (`price`) and identifier
 * fields are reused from the first occurrence — all rows that share a
 * series id share their billing identity. Timestamp is dropped because an
 * aggregate row spans the whole run.
 */
function aggregatePriceLineItems(lineItems: AgentPriceSummaryLineItem[]): AgentPriceSummaryLineItem[] {
  const aggregatesById = new Map<string, AgentPriceSummaryLineItem>();
  for (const item of lineItems) {
    const id = priceLineItemSeriesId(item);
    const existing = aggregatesById.get(id);
    if (existing === undefined) {
      aggregatesById.set(id, { ...item, id, timestamp: undefined });
      continue;
    }
    aggregatesById.set(id, {
      ...existing,
      quantity: existing.quantity + item.quantity,
      total: existing.total + item.total,
    });
  }
  return Array.from(aggregatesById.values()).sort((a, b) => b.total - a.total);
}

export const priceChartModeOptions = [
  { value: 'price', label: 'Price' },
  { value: 'quantity', label: 'Quantity' },
];

const knownLogoProviders = new Set(['anthropic', 'claude-code', 'ollama', 'openai', 'openrouter']);
const priceLineItemColumns: TableColumn<AgentPriceSummaryLineItem>[] = [
  {
    id: 'icon',
    header: '',
    width: '44px',
    cell: (row) => <ProviderMark provider={row.provider} />,
  },
  {
    id: 'name',
    header: 'Name',
    cell: (row) => (
      <div className="min-w-[220px]">
        <div className="truncate text-sm font-medium text-content">{row.charge}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-content-muted">
          <span>{formatProviderLabel(row.provider)}</span>
          {row.modelId.length > 0 ? <span>{row.modelId}</span> : null}
          {row.modelVariantId !== undefined ? <span>{row.modelVariantId}</span> : null}
        </div>
      </div>
    ),
  },
  {
    align: 'right',
    id: 'quantity',
    header: 'Quantity',
    cell: (row) => <span className="tabular-nums">{formatQuantity(row.quantity)}</span>,
  },
  {
    align: 'right',
    id: 'rate',
    header: 'Rate / M',
    cell: (row) => <span className="tabular-nums">{formatUsdPrecise(row.price * 1_000_000)}</span>,
  },
  {
    align: 'right',
    id: 'total',
    header: 'Total',
    cell: (row) => <span className="tabular-nums">{formatUsdPrecise(row.total)}</span>,
  },
];

function getPriceLineItemRowKey(row: AgentPriceSummaryLineItem, index: number) {
  return `${row.id}:${index}`;
}

function formatProviderLabel(value: string) {
  if (value.length === 0) {
    return 'Unknown provider';
  }
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function formatQuantity(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatUsd(value: number) {
  return value.toLocaleString('en-US', {
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  });
}

function formatUsdPrecise(value: number) {
  return value.toLocaleString('en-US', {
    currency: 'USD',
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
    style: 'currency',
  });
}
