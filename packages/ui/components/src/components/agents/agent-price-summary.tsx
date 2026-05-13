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

export interface AgentPriceLineItemListProps {
  lineItems: AgentPriceSummaryLineItem[];
}

export interface AgentPriceTotalProps {
  lineItems: AgentPriceSummaryLineItem[];
}

export function AgentPriceTotal(props: AgentPriceTotalProps) {
  const total = props.lineItems.reduce((sum, item) => sum + item.total, 0);
  const items = useMemo(() => buildPriceTotalItems(props.lineItems), [props.lineItems]);

  return (
    <div className="space-y-3">
      <div className="text-2xl font-medium tabular-nums text-content">{formatUsd(total)}</div>
      <ProportionalBarChart height={10} items={items} valueFormatter={formatUsd} />
    </div>
  );
}

export function AgentPriceSummary(props: AgentPriceSummaryProps) {
  const chartData = useMemo(
    () => buildPriceChartData(props.lineItems, props.chartMode),
    [props.chartMode, props.lineItems],
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
  return <Table columns={priceLineItemColumns} rows={props.lineItems} getRowKey={getPriceLineItemRowKey} />;
}

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

function buildPriceChartData(lineItems: AgentPriceSummaryLineItem[], mode: PriceChartMode): PriceChartData {
  const series = buildPriceChartSeries(lineItems);
  const startTimestamp = Math.min(...lineItems.map((item) => item.timestamp ?? Number.POSITIVE_INFINITY));
  const fallbackStart = Number.isFinite(startTimestamp) ? startTimestamp : 0;
  const points = lineItems.map((item, index) => ({
    seriesId: priceLineItemSeriesId(item),
    timestamp: item.timestamp ?? fallbackStart + index,
    value: mode === 'price' ? roundPrice(item.total) : item.quantity,
  }));

  return { points, series };
}

function roundPrice(value: number) {
  return Number(value.toFixed(2));
}

function buildPriceChartSeries(lineItems: AgentPriceSummaryLineItem[]) {
  const ids = Array.from(new Set(lineItems.map((item) => priceLineItemSeriesId(item))));
  return ids.map((id, index) => ({
    color: chartPaletteColor(index),
    id,
    label: id,
  }));
}

function buildPriceTotalItems(lineItems: AgentPriceSummaryLineItem[]): ProportionalBarChartItem[] {
  const totalsById = new Map<string, number>();
  for (const item of lineItems) {
    const id = priceLineItemSeriesId(item);
    totalsById.set(id, (totalsById.get(id) ?? 0) + item.total);
  }

  return Array.from(totalsById.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      color: chartPaletteColor(index),
      label,
      value,
    }));
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
