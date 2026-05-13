import type { Datastore } from '../datastore';
import { useDatastoreForTesting } from './datastore-test-env';

export const METRICS_BUCKET_MS = 60_000;

export interface MetricSeedSample {
  name: string;
  value: number;
  dimensions?: Record<string, string>;
  timestamp: number;
}

export async function seedMetrics(datastore: Datastore, samples: MetricSeedSample[]) {
  for (const sample of samples) {
    await datastore.metrics.write({
      name: sample.name,
      value: sample.value,
      dimensions: sample.dimensions ?? {},
      timestamp: sample.timestamp,
    });
  }
}

export async function writeMetricSample() {
  const datastore = await useDatastoreForTesting();
  const written = await datastore.metrics.write({
    name: 'op.run.duration',
    value: 12.5,
    dimensions: { region: 'us', op: 'foo' },
    timestamp: 1_700_000_000_000,
  });
  await datastore.close();
  return written;
}

export async function querySingleBucketMetrics() {
  const datastore = await useDatastoreForTesting();
  await seedMetrics(datastore, [
    { name: 'op.run.duration', value: 1, timestamp: 1_700_000_000_000 },
    { name: 'op.run.duration', value: 5, timestamp: 1_700_000_010_000 },
    { name: 'op.run.duration', value: 9, timestamp: 1_700_000_020_000 },
  ]);
  const result = await datastore.metrics.queryAggregated({
    name: 'op.run.duration',
    fromTimestamp: 1_700_000_000_000,
    toTimestamp: 1_700_000_060_000,
    bucketSizeMs: METRICS_BUCKET_MS,
  });
  return { datastore, result };
}

export async function queryDistinctBucketMetrics() {
  const datastore = await useDatastoreForTesting();
  const t0 = 1_700_000_000_000;
  await seedMetrics(datastore, [
    { name: 'op.run.duration', value: 1, timestamp: t0 },
    { name: 'op.run.duration', value: 2, timestamp: t0 + 1_000 },
    { name: 'op.run.duration', value: 10, timestamp: t0 + 60_000 },
    { name: 'op.run.duration', value: 20, timestamp: t0 + 90_000 },
  ]);
  const result = await datastore.metrics.queryAggregated({
    name: 'op.run.duration',
    fromTimestamp: t0,
    toTimestamp: t0 + 180_000,
    bucketSizeMs: METRICS_BUCKET_MS,
  });
  return { datastore, result };
}

export async function queryDimensionFilteredMetrics() {
  const datastore = await useDatastoreForTesting();
  const t0 = 1_700_000_000_000;
  await seedMetrics(datastore, [
    { name: 'op.run.duration', value: 1, dimensions: { region: 'us', op: 'foo' }, timestamp: t0 },
    { name: 'op.run.duration', value: 2, dimensions: { region: 'us', op: 'bar' }, timestamp: t0 + 1_000 },
    { name: 'op.run.duration', value: 100, dimensions: { region: 'eu', op: 'foo' }, timestamp: t0 + 2_000 },
  ]);
  const result = await datastore.metrics.queryAggregated({
    name: 'op.run.duration',
    fromTimestamp: t0,
    toTimestamp: t0 + 60_000,
    bucketSizeMs: METRICS_BUCKET_MS,
    dimensions: { region: 'us' },
  });
  return { datastore, result };
}

export async function querySingleMetricNameOnly() {
  const datastore = await useDatastoreForTesting();
  const t0 = 1_700_000_000_000;
  await seedMetrics(datastore, [
    { name: 'op.run.duration', value: 5, timestamp: t0 },
    { name: 'other.metric', value: 999, timestamp: t0 + 100 },
  ]);
  const result = await datastore.metrics.queryAggregated({
    name: 'op.run.duration',
    fromTimestamp: t0,
    toTimestamp: t0 + 60_000,
    bucketSizeMs: METRICS_BUCKET_MS,
  });
  return { datastore, result };
}

export async function listMetricNamesWithSamples() {
  const datastore = await useDatastoreForTesting();
  await seedMetrics(datastore, [
    { name: 'op.run.duration', value: 1, timestamp: 1000 },
    { name: 'op.run.duration', value: 2, timestamp: 3000 },
    { name: 'op.run.success', value: 1, timestamp: 2000 },
  ]);
  const result = await datastore.metrics.listNames({});
  return { datastore, result };
}

export async function listMetricVariantsWithSamples() {
  const datastore = await useDatastoreForTesting();
  const t0 = 1_700_000_000_000;
  await seedMetrics(datastore, [
    { name: 'op.run.duration', value: 1, dimensions: { region: 'us', op: 'foo' }, timestamp: t0 },
    { name: 'op.run.duration', value: 2, dimensions: { region: 'us', op: 'foo' }, timestamp: t0 + 1 },
    { name: 'op.run.duration', value: 3, dimensions: { region: 'eu', op: 'bar' }, timestamp: t0 + 2 },
    { name: 'other.metric', value: 9, dimensions: { region: 'us' }, timestamp: t0 + 3 },
  ]);
  const result = await datastore.metrics.listVariants({ name: 'op.run.duration' });
  return { datastore, result, t0 };
}
