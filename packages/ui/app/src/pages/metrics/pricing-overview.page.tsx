import {
  AppBox,
  AppButton,
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
import {
  useAgentRegistries,
  useAgents,
  useInferenceProfiles,
  useIntegrations,
  useRealtimeDatastore,
} from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { buildPricingLabelLookup, type PricingLabelLookup } from './pricing-label-lookup';

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
const DEFAULT_RANGE_OPTION: RangeOption = { id: '1h', label: '1h', windowMs: 60 * 60_000, bucketSizeMs: 60_000 };

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

export function PricingOverviewPage() {
  const datastore = useRealtimeDatastore();
  const agents = useAgents();
  const agentRegistries = useAgentRegistries();
  const integrations = useIntegrations();
  const inferenceProfiles = useInferenceProfiles();

  const [rangeId, setRangeId] = useState<string>(DEFAULT_RANGE_OPTION.id);
  const [groupBy, setGroupBy] = useState<GroupByKey>('charge');
  const [variants, setVariants] = useState<MetricVariant[]>([]);
  const [seriesBuckets, setSeriesBuckets] = useState<{ value: string; buckets: MetricAggregateBucket[] }[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [domain, setDomain] = useState<{ min: number; max: number }>({ min: 0, max: 1 });

  const range = RANGE_OPTIONS.find((option) => option.id === rangeId) ?? DEFAULT_RANGE_OPTION;

  useEffect(() => {
    let active = true;
    void datastore.metrics
      .listVariants({ name: METRIC_NAME })
      .then((result) => {
        if (active) {
          setVariants(result.items);
        }
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
      if (value === undefined || value === '') {
        continue;
      }
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
        if (active) {
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [datastore, range, groupBy, groupValues]);

  const labelLookup = useMemo<PricingLabelLookup>(
    () =>
      buildPricingLabelLookup({
        agents: agents.values(),
        agentRegistries: agentRegistries.values(),
        inferenceProfiles: inferenceProfiles.values(),
        integrations: integrations.values(),
      }),
    [agents, agentRegistries, integrations, inferenceProfiles],
  );

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
    for (const entry of seriesBuckets) {
      for (const bucket of entry.buckets) {
        sum += bucket.sum;
      }
    }
    return sum;
  }, [seriesBuckets]);

  return (
    <PageLayout width="fixed">
      <Header subtitle="Total model spend over time, stacked by the dimension of your choice.">Pricing overview</Header>

      <Section
        title="Spend"
        actionItems={
          <AppBox variant="controls-row">
            <Select
              options={GROUP_BY_OPTIONS.map((option) => ({ value: option.key, label: option.label }))}
              value={groupBy}
              onChange={(value) => setGroupBy(value as GroupByKey)}
            />
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
              <AppBox variant="kpi-value">${totalSum.toFixed(2)}</AppBox>
            </div>
            <div>
              <AppBox variant="kpi-label">Series</AppBox>
              <AppBox variant="kpi-value">{series.length}</AppBox>
            </div>
          </AppBox>
          <AppBox variant="chart-body">
            {status === 'error' ? (
              <AppBox as="p" variant="muted-xs">
                Failed to load pricing data.
              </AppBox>
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
          </AppBox>
        </Surface>
      </Section>
    </PageLayout>
  );
}
