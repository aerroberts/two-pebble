import {
  Header,
  PageLayout,
  Section,
  Select,
  StackedTimelineBarChart,
  type StackedTimelineBarChartPoint,
  type StackedTimelineBarChartSeries,
  Surface,
} from '@two-pebble/components';
import type { MetricAggregateBucket, MetricVariant } from '@two-pebble/protocol';
import { useAgents, useInferenceProfiles, useIntegrations, useRealtimeDatastore } from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';

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

const GROUP_BY_OPTIONS = [
  { key: 'charge', label: 'By charge' },
  { key: 'provider', label: 'By provider' },
  { key: 'modelId', label: 'By model' },
  { key: 'agentId', label: 'By agent' },
  { key: 'inferenceProfileId', label: 'By inference profile' },
  { key: 'integrationId', label: 'By integration' },
] as const;

type GroupByKey = (typeof GROUP_BY_OPTIONS)[number]['key'];

const METRIC_NAME = 'pricing.total';
const MAX_SERIES = 12;

const CONTROLS_ROW = 'flex items-center gap-3';
const RANGE_BUTTONS = 'flex gap-1';
const RANGE_BUTTON_ACTIVE = 'rounded-md bg-surface-active px-2 py-1 text-xs font-medium text-content';
const RANGE_BUTTON_IDLE = 'rounded-md px-2 py-1 text-xs text-content-muted hover:bg-surface-hover';
const CHART_HEADER_ROW = 'flex items-baseline gap-6 border-b border-border px-4 py-3';
const KPI_LABEL = 'text-xs text-content-muted';
const KPI_VALUE = 'text-lg font-semibold text-content';
const CHART_BODY = 'p-4';
const ERROR_TEXT = 'text-xs text-content-muted';

export function PricingOverviewPage() {
  const datastore = useRealtimeDatastore();
  const agents = useAgents();
  const integrations = useIntegrations();
  const inferenceProfiles = useInferenceProfiles();

  const [rangeId, setRangeId] = useState<string>(RANGE_OPTIONS[1]!.id);
  const [groupBy, setGroupBy] = useState<GroupByKey>('charge');
  const [variants, setVariants] = useState<MetricVariant[]>([]);
  const [seriesBuckets, setSeriesBuckets] = useState<{ value: string; buckets: MetricAggregateBucket[] }[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [domain, setDomain] = useState<{ min: number; max: number }>({ min: 0, max: 1 });

  const range = RANGE_OPTIONS.find((option) => option.id === rangeId) ?? RANGE_OPTIONS[1]!;

  useEffect(() => {
    let active = true;
    void datastore.metrics
      .listVariants({ name: METRIC_NAME })
      .then((result) => {
        if (active) setVariants(result.items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [datastore]);

  const groupValues = useMemo(() => {
    const counts = new Map<string, number>();
    for (const variant of variants) {
      const value = variant.dimensions[groupBy];
      if (value === undefined || value === '') continue;
      counts.set(value, (counts.get(value) ?? 0) + variant.sampleCount);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SERIES)
      .map(([value]) => value);
  }, [variants, groupBy]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - range.windowMs;

    if (groupValues.length === 0) {
      setSeriesBuckets([]);
      setDomain({ min: fromTimestamp, max: toTimestamp });
      setStatus('ready');
      return () => {
        active = false;
      };
    }

    const requests = groupValues.map((value) =>
      datastore.metrics
        .queryAggregated({
          name: METRIC_NAME,
          fromTimestamp,
          toTimestamp,
          bucketSizeMs: range.bucketSizeMs,
          dimensions: { [groupBy]: value },
        })
        .then((result) => ({ value, buckets: result.buckets })),
    );
    Promise.all(requests)
      .then((items) => {
        if (active) {
          setSeriesBuckets(items);
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
  }, [datastore, range, groupBy, groupValues]);

  const labelLookup = useMemo<Record<GroupByKey, Map<string, string>>>(() => {
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

  const series = useMemo<StackedTimelineBarChartSeries[]>(() => {
    return seriesBuckets.map((entry) => ({
      id: entry.value,
      label: labelLookup[groupBy].get(entry.value) ?? entry.value,
    }));
  }, [seriesBuckets, groupBy, labelLookup]);

  const points = useMemo<StackedTimelineBarChartPoint[]>(() => {
    const out: StackedTimelineBarChartPoint[] = [];
    for (const entry of seriesBuckets) {
      for (const bucket of entry.buckets) {
        out.push({ timestamp: bucket.bucketStart, seriesId: entry.value, value: bucket.sum });
      }
    }
    return out;
  }, [seriesBuckets]);

  const totalSum = useMemo(() => {
    let sum = 0;
    for (const entry of seriesBuckets) for (const bucket of entry.buckets) sum += bucket.sum;
    return sum;
  }, [seriesBuckets]);

  return (
    <PageLayout width="fixed">
      <Header subtitle="Total model spend over time, stacked by the dimension of your choice.">Pricing overview</Header>

      <Section
        title="Spend"
        actionItems={
          <div className={CONTROLS_ROW}>
            <Select
              options={GROUP_BY_OPTIONS.map((option) => ({ value: option.key, label: option.label }))}
              value={groupBy}
              onChange={(value) => setGroupBy(value as GroupByKey)}
            />
            <div className={RANGE_BUTTONS}>
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRangeId(option.id)}
                  className={option.id === rangeId ? RANGE_BUTTON_ACTIVE : RANGE_BUTTON_IDLE}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <Surface>
          <div className={CHART_HEADER_ROW}>
            <div>
              <div className={KPI_LABEL}>Total in window</div>
              <div className={KPI_VALUE}>${totalSum.toFixed(2)}</div>
            </div>
            <div>
              <div className={KPI_LABEL}>Series</div>
              <div className={KPI_VALUE}>{series.length}</div>
            </div>
          </div>
          <div className={CHART_BODY}>
            {status === 'error' ? (
              <p className={ERROR_TEXT}>Failed to load pricing data.</p>
            ) : (
              <StackedTimelineBarChart
                points={points}
                series={series}
                startTime={domain.min}
                endTime={domain.max}
                valueFormatter={(value) => `$${value.toFixed(2)}`}
                emptyMessage={status === 'loading' ? 'Loading pricing data.' : 'No samples in this window.'}
              />
            )}
          </div>
        </Surface>
      </Section>
    </PageLayout>
  );
}
