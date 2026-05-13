import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';
import {
  expectDistinctBucketsInOrder,
  listMetricNamesWithSamples,
  listMetricVariantsWithSamples,
  METRICS_BUCKET_MS,
  queryDimensionFilteredMetrics,
  queryDistinctBucketMetrics,
  querySingleBucketMetrics,
  querySingleMetricNameOnly,
  writeMetricSample,
} from '../testing/metrics-test-env';

describe('feature: operation metrics.write', () => {
  test('happy: persists name, value, dimensions, and caller timestamp', async () => {
    const written = await writeMetricSample();
    expect(written).toMatchObject({
      name: 'op.run.duration',
      value: 12.5,
      dimensions: { region: 'us', op: 'foo' },
      createdAt: 1_700_000_000_000,
    });
  });
});

describe('feature: operation metrics.query-aggregated', () => {
  test('happy: aggregates samples into one bucket with min/max/avg/sum/count', async () => {
    const { datastore, result } = await querySingleBucketMetrics();
    await datastore.close();
    expect(result.buckets).toHaveLength(1);
    const bucket = result.buckets[0];
    expect(bucket).toMatchObject({ sampleCount: 3, min: 1, max: 9, sum: 15 });
    expect(bucket?.avg).toBeCloseTo(5);
  });

  test('happy: groups samples across distinct time buckets', async () => {
    const { datastore, result } = await queryDistinctBucketMetrics();
    await datastore.close();
    expect(result.buckets).toMatchObject([
      { sampleCount: 2, sum: 3 },
      { sampleCount: 2, sum: 30 },
    ]);
    expectDistinctBucketsInOrder(result.buckets);
  });

  test('happy: filters by partial dimension match', async () => {
    const { datastore, result } = await queryDimensionFilteredMetrics();
    await datastore.close();
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0]?.sampleCount).toBe(2);
    expect(result.buckets[0]?.sum).toBe(3);
  });

  test('happy: ignores rows from other metric names', async () => {
    const { datastore, result } = await querySingleMetricNameOnly();
    await datastore.close();
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0]?.sum).toBe(5);
  });

  test('happy: returns empty when nothing matches', async () => {
    const datastore = await useDatastoreForTesting();
    const result = await datastore.metrics.queryAggregated({
      name: 'op.run.duration',
      fromTimestamp: 0,
      toTimestamp: 1,
      bucketSizeMs: METRICS_BUCKET_MS,
    });
    await datastore.close();
    expect(result.buckets).toEqual([]);
  });

  test('unhappy: rejects non-positive bucketSizeMs', async () => {
    const datastore = await useDatastoreForTesting();
    await expect(
      datastore.metrics.queryAggregated({
        name: 'op.run.duration',
        fromTimestamp: 0,
        toTimestamp: 60_000,
        bucketSizeMs: 0,
      }),
    ).rejects.toThrow();
    await datastore.close();
  });
});

describe('feature: operation metrics.list-names', () => {
  test('happy: returns distinct names with summary', async () => {
    const { datastore, result } = await listMetricNamesWithSamples();
    await datastore.close();
    expect(result.items).toHaveLength(2);
    const dur = result.items.find((i) => i.name === 'op.run.duration');
    expect(dur).toMatchObject({ sampleCount: 2, firstSeenAt: 1000, lastSeenAt: 3000 });
  });
});

describe('feature: operation metrics.list-variants', () => {
  test('happy: returns one row per distinct dimension combo for a metric', async () => {
    const { datastore, result, t0 } = await listMetricVariantsWithSamples();
    await datastore.close();
    expect(result.items).toHaveLength(2);
    const top = result.items[0];
    expect(top).toMatchObject({ dimensions: { region: 'us', op: 'foo' }, sampleCount: 2, lastSeenAt: t0 + 1 });
    const second = result.items[1];
    expect(second).toMatchObject({ dimensions: { region: 'eu', op: 'bar' }, sampleCount: 1 });
  });
});
