import {
  Header,
  AppBox,
  AppButton,
  LineChart,
  type LineChartPoint,
  PageLayout,
  Section,
  Surface,
  Table,
  type TableColumn,
} from '@two-pebble/components';
import type { MetricAggregateBucket, MetricVariant } from '@two-pebble/protocol';
import { useRealtimeDatastore } from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

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

export function MetricDetailPage() {
  const { metricName } = useParams<{ metricName: string }>();
  const datastore = useRealtimeDatastore();
  const decodedName = metricName !== undefined ? decodeURIComponent(metricName) : '';
  const [rangeId, setRangeId] = useState<string>(RANGE_OPTIONS[1]!.id);
  const [buckets, setBuckets] = useState<MetricAggregateBucket[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [domain, setDomain] = useState<{ min: number; max: number }>({ min: 0, max: 1 });
  const [variants, setVariants] = useState<MetricVariant[]>([]);
  const [variantsStatus, setVariantsStatus] = useState<LoadStatus>('idle');
  const [activeVariantKey, setActiveVariantKey] = useState<string | null>(null);

  const range = RANGE_OPTIONS.find((option) => option.id === rangeId) ?? RANGE_OPTIONS[1]!;
  const activeFilter = useMemo(() => {
    if (activeVariantKey === null) return undefined;
    return variants.find((variant) => variantKey(variant) === activeVariantKey)?.dimensions;
  }, [activeVariantKey, variants]);

  useEffect(() => {
    if (decodedName === '') return;
    let active = true;
    setVariantsStatus('loading');
    void datastore.metrics
      .listVariants({ name: decodedName })
      .then((result) => {
        if (active) {
          setVariants(result.items);
          setVariantsStatus('ready');
        }
      })
      .catch(() => {
        if (active) setVariantsStatus('error');
      });
    return () => {
      active = false;
    };
  }, [datastore, decodedName]);

  useEffect(() => {
    if (decodedName === '') return;
    let active = true;
    setStatus('loading');
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - range.windowMs;
    void datastore.metrics
      .queryAggregated({
        name: decodedName,
        fromTimestamp,
        toTimestamp,
        bucketSizeMs: range.bucketSizeMs,
        dimensions: activeFilter,
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
  }, [datastore, decodedName, range, activeFilter]);

  const aggregatedPoints = useMemo<LineChartPoint[]>(
    () =>
      buckets.flatMap((bucket) => [
        { timestamp: bucket.bucketStart, seriesId: 'avg', value: bucket.avg },
        { timestamp: bucket.bucketStart, seriesId: 'min', value: bucket.min },
        { timestamp: bucket.bucketStart, seriesId: 'max', value: bucket.max },
      ]),
    [buckets],
  );

  const dimensionColumnKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const variant of variants) {
      for (const key of Object.keys(variant.dimensions)) keys.add(key);
    }
    return Array.from(keys).sort();
  }, [variants]);

  const totalSamples = buckets.reduce((sum, b) => sum + b.sampleCount, 0);

  return (
    <PageLayout width="fixed">
      <Header subtitle={`${totalSamples.toLocaleString()} samples in window`}>{decodedName}</Header>

      <Section
        title="Chart"
        actionItems={
          <AppBox variant="range-buttons">
            {RANGE_OPTIONS.map((option) => {
              const active = option.id === rangeId;
              return (
                <AppButton
                  key={option.id}
                  type="button"
                  onClick={() => setRangeId(option.id)}
                  variant={active ? 'range-active' : 'range-idle'}
                >
                  {option.label}
                </AppButton>
              );
            })}
          </AppBox>
        }
      >
        <Surface>
          <AppBox variant="chart-body">
            {status === 'error' ? (
              <AppBox as="p" variant="muted-xs">Failed to load metric data.</AppBox>
            ) : (
              <LineChart
                points={aggregatedPoints}
                series={[
                  { id: 'avg', label: 'Average', color: 'blue' },
                  { id: 'min', label: 'Min', color: 'green' },
                  { id: 'max', label: 'Max', color: 'amber' },
                ]}
                startTime={domain.min}
                endTime={domain.max}
                emptyMessage={status === 'loading' ? 'Loading metric data.' : 'No samples in this window.'}
              />
            )}
          </AppBox>
        </Surface>
      </Section>

      <Section title="Dimensions">
        <Surface>
          <VariantsTable
            variants={variants}
            dimensionKeys={dimensionColumnKeys}
            activeKey={activeVariantKey}
            onSelect={(key) => setActiveVariantKey((current) => (current === key ? null : key))}
            emptyMessage={
              variantsStatus === 'loading'
                ? 'Loading dimensions.'
                : variantsStatus === 'error'
                  ? 'Failed to load dimensions.'
                  : 'No dimensions emitted yet.'
            }
          />
        </Surface>
      </Section>
    </PageLayout>
  );
}

interface VariantsTableProps {
  variants: MetricVariant[];
  dimensionKeys: string[];
  activeKey: string | null;
  onSelect: (key: string) => void;
  emptyMessage: string;
}

function VariantsTable(props: VariantsTableProps) {
  const columns = useMemo<TableColumn<MetricVariant>[]>(() => {
    const dimensionColumns: TableColumn<MetricVariant>[] = props.dimensionKeys.map((key) => ({
      id: `dim-${key}`,
      header: key,
      cell: (row) => row.dimensions[key] ?? <AppBox as="span" variant="faint-text">—</AppBox>,
    }));
    return [
      {
        id: 'active',
        header: '',
        width: '24px',
        cell: (row) => (
          <AppBox
            aria-hidden
            as="span"
            variant={variantKey(row) === props.activeKey ? 'metric-active-dot' : 'metric-inactive-dot'}
          >
            ●
          </AppBox>
        ),
      },
      ...dimensionColumns,
      {
        id: 'samples',
        header: 'Samples',
        align: 'right',
        cell: (row) => row.sampleCount.toLocaleString(),
      },
    ];
  }, [props.dimensionKeys, props.activeKey]);

  return (
    <Table
      columns={columns}
      rows={props.variants}
      getRowKey={(row) => variantKey(row)}
      onRowClick={(row) => props.onSelect(variantKey(row))}
      emptyMessage={props.emptyMessage}
    />
  );
}

function variantKey(variant: MetricVariant): string {
  const entries = Object.entries(variant.dimensions).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join('|');
}
