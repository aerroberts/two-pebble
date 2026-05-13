import {
  Header,
  AppBox,
  AppButton,
  PageLayout,
  Section,
  Select,
  StackedTimelineBarChart,
  type StackedTimelineBarChartPoint,
  Surface,
} from '@two-pebble/components';
import type { MetricAggregateBucket, MetricVariant } from '@two-pebble/protocol';
import { useAgents, useInferenceProfiles, useIntegrations, useRealtimeDatastore } from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface RangeOption {
  id: string;
  label: string;
  windowMs: number;
  bucketSizeMs: number;
}

const RANGE_OPTIONS: RangeOption[] = [
  { id: '5m', label: '5m', windowMs: 5 * 60_000, bucketSizeMs: 10_000 },
  { id: '1h', label: '1h', windowMs: 60 * 60_000, bucketSizeMs: 60_000 },
  { id: '24h', label: '24h', windowMs: 24 * 60 * 60_000, bucketSizeMs: 5 * 60_000 },
  { id: '7d', label: '7d', windowMs: 7 * 24 * 60 * 60_000, bucketSizeMs: 60 * 60_000 },
];

type MetricKey = 'pricing.total' | 'pricing.quantity';

const METRIC_OPTIONS: { value: MetricKey; label: string }[] = [
  { value: 'pricing.total', label: 'Cost (USD)' },
  { value: 'pricing.quantity', label: 'Quantity' },
];

const FILTER_DIMENSIONS = [
  { key: 'charge', label: 'Charge' },
  { key: 'provider', label: 'Provider' },
  { key: 'modelId', label: 'Model' },
  { key: 'agentId', label: 'Agent' },
  { key: 'inferenceProfileId', label: 'Inference profile' },
  { key: 'integrationId', label: 'Integration' },
] as const;

type FilterDimension = (typeof FILTER_DIMENSIONS)[number];
type FilterKey = FilterDimension['key'];

interface FilterFieldProps {
  dimension: FilterDimension;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
}

function FilterField(props: FilterFieldProps) {
  return (
    <AppBox variant="filter-field">
      <AppBox as="label" variant="filter-label">{props.dimension.label}</AppBox>
      <Select
        options={props.options}
        value={props.value ?? '__all__'}
        searchable
        fullWidth
        placeholder="All"
        disabled={props.options.length <= 1}
        onChange={props.onChange}
      />
    </AppBox>
  );
}

export function PricingExplorerPage() {
  const datastore = useRealtimeDatastore();
  const agents = useAgents();
  const integrations = useIntegrations();
  const inferenceProfiles = useInferenceProfiles();

  const [metric, setMetric] = useState<MetricKey>('pricing.total');
  const [rangeId, setRangeId] = useState<string>(RANGE_OPTIONS[1]!.id);
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});

  const [variants, setVariants] = useState<MetricVariant[]>([]);
  const [buckets, setBuckets] = useState<MetricAggregateBucket[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [domain, setDomain] = useState<{ min: number; max: number }>({ min: 0, max: 1 });

  const range = RANGE_OPTIONS.find((option) => option.id === rangeId) ?? RANGE_OPTIONS[1]!;

  const dimensionFilter = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters)) if (value !== undefined) out[key] = value;
    return out;
  }, [filters]);

  useEffect(() => {
    let active = true;
    void datastore.metrics
      .listVariants({ name: metric })
      .then((result) => {
        if (active) setVariants(result.items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [datastore, metric]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - range.windowMs;
    void datastore.metrics
      .queryAggregated({
        name: metric,
        fromTimestamp,
        toTimestamp,
        bucketSizeMs: range.bucketSizeMs,
        dimensions: Object.keys(dimensionFilter).length > 0 ? dimensionFilter : undefined,
      })
      .then((result) => {
        if (active) {
          setBuckets(result.buckets);
          setDomain({ min: fromTimestamp, max: toTimestamp });
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [datastore, metric, range, dimensionFilter]);

  const labelLookup = useMemo<Record<FilterKey, Map<string, string>>>(() => {
    const agentMap = new Map<string, string>();
    for (const agent of agents.values()) agentMap.set(agent.id, agent.name || agent.id);
    const integrationMap = new Map<string, string>();
    for (const integration of integrations.values())
      integrationMap.set(integration.id, integration.name || integration.id);
    const profileMap = new Map<string, string>();
    for (const profile of inferenceProfiles.values()) profileMap.set(profile.id, profile.name || profile.id);
    return {
      charge: new Map(),
      provider: new Map(),
      modelId: new Map(),
      agentId: agentMap,
      inferenceProfileId: profileMap,
      integrationId: integrationMap,
    };
  }, [agents, integrations, inferenceProfiles]);

  const filterOptions = useMemo<Record<FilterKey, { value: string; label: string }[]>>(() => {
    const collected: Record<FilterKey, Set<string>> = {
      charge: new Set(),
      provider: new Set(),
      modelId: new Set(),
      agentId: new Set(),
      inferenceProfileId: new Set(),
      integrationId: new Set(),
    };
    for (const variant of variants) {
      for (const { key } of FILTER_DIMENSIONS) {
        const value = variant.dimensions[key];
        if (value !== undefined && value !== '') collected[key].add(value);
      }
    }
    const out = {} as Record<FilterKey, { value: string; label: string }[]>;
    for (const { key } of FILTER_DIMENSIONS) {
      const options = Array.from(collected[key])
        .map((value) => ({ value, label: labelLookup[key].get(value) ?? value }))
        .sort((a, b) => a.label.localeCompare(b.label));
      out[key] = [{ value: '__all__', label: 'All' }, ...options];
    }
    return out;
  }, [variants, labelLookup]);

  const points = useMemo<StackedTimelineBarChartPoint[]>(() => {
    return buckets.map((bucket) => ({
      timestamp: bucket.bucketStart,
      seriesId: 'sum',
      value: bucket.sum,
    }));
  }, [buckets]);

  const totals = useMemo(() => {
    let sum = 0;
    let samples = 0;
    for (const bucket of buckets) {
      sum += bucket.sum;
      samples += bucket.sampleCount;
    }
    return { sum, samples };
  }, [buckets]);

  const isCost = metric === 'pricing.total';
  const totalLabel = isCost ? `$${totals.sum.toFixed(2)}` : totals.sum.toLocaleString();
  const valueLabel = isCost ? 'USD' : 'Quantity';
  const valueFormatter = isCost ? (value: number) => `$${value.toFixed(2)}` : undefined;

  return (
    <PageLayout width="fixed">
      <Header subtitle="Aggregate model pricing across runs. Filter by any dimension to scope the chart.">
        Pricing
      </Header>

      <Section
        title="Chart"
        actionItems={
          <AppBox variant="controls-row">
            <Select options={METRIC_OPTIONS} value={metric} onChange={(value) => setMetric(value as MetricKey)} />
            <AppBox variant="range-buttons">
              {RANGE_OPTIONS.map((option) => (
                <AppButton
                  key={option.id}
                  type="button"
                  onClick={() => setRangeId(option.id)}
                  variant={option.id === rangeId ? 'range-active' : 'range-idle'}
                >
                  {option.label}
                </AppButton>
              ))}
            </AppBox>
          </AppBox>
        }
      >
        <Surface>
          <AppBox variant="chart-header-row">
            <div>
              <AppBox variant="kpi-label">Total in window</AppBox>
              <AppBox variant="kpi-value">{totalLabel}</AppBox>
            </div>
            <div>
              <AppBox variant="kpi-label">Samples</AppBox>
              <AppBox variant="kpi-value">{totals.samples.toLocaleString()}</AppBox>
            </div>
          </AppBox>
          <AppBox variant="chart-body">
            {status === 'error' ? (
              <AppBox as="p" variant="muted-xs">Failed to load metric data.</AppBox>
            ) : (
              <StackedTimelineBarChart
                points={points}
                series={[{ id: 'sum', label: valueLabel }]}
                startTime={domain.min}
                endTime={domain.max}
                valueFormatter={valueFormatter}
                emptyMessage={status === 'loading' ? 'Loading metric data.' : 'No samples in this window.'}
              />
            )}
          </AppBox>
        </Surface>
      </Section>

      <Section title="Filters">
        <Surface>
          <AppBox variant="filter-grid">
            {FILTER_DIMENSIONS.map((dimension) => (
              <FilterField
                key={dimension.key}
                dimension={dimension}
                options={filterOptions[dimension.key]}
                value={filters[dimension.key]}
                onChange={(value) =>
                  setFilters((prev) => {
                    const next = { ...prev };
                    if (value === '__all__') delete next[dimension.key];
                    else next[dimension.key] = value;
                    return next;
                  })
                }
              />
            ))}
          </AppBox>
        </Surface>
      </Section>
    </PageLayout>
  );
}
