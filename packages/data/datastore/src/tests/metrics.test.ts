import { describe, expect, test } from 'bun:test';
import type { Datastore } from '../datastore';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

const BUCKET_MS = 60_000;

async function seed(
  datastore: Datastore,
  samples: Array<{
    name: string;
    value: number;
    dimensions?: Record<string, string>;
    timestamp: number;
  }>,
) {
  for (const sample of samples) {
    await datastore.metrics.write({
      name: sample.name,
      value: sample.value,
      dimensions: sample.dimensions ?? {},
      timestamp: sample.timestamp,
    });
  }
}

describe('feature: operation metrics.write', () => {
  test('happy: persists name, value, dimensions, and caller timestamp', async () => {
    const datastore = await useDatastoreForTesting();
    const written = await datastore.metrics.write({
      name: 'op.run.duration',
      value: 12.5,
      dimensions: { region: 'us', op: 'foo' },
      timestamp: 1_700_000_000_000,
    });
    await datastore.close();
    expect(written.name).toBe('op.run.duration');
    expect(written.value).toBe(12.5);
    expect(written.dimensions).toEqual({ region: 'us', op: 'foo' });
    expect(written.createdAt).toBe(1_700_000_000_000);
  });
});

describe('feature: operation metrics.query-aggregated', () => {
  test('happy: aggregates samples into one bucket with min/max/avg/sum/count', async () => {
    const datastore = await useDatastoreForTesting();
    await seed(datastore, [
      { name: 'op.run.duration', value: 1, timestamp: 1_700_000_000_000 },
      { name: 'op.run.duration', value: 5, timestamp: 1_700_000_010_000 },
      { name: 'op.run.duration', value: 9, timestamp: 1_700_000_020_000 },
    ]);
    const result = await datastore.metrics.queryAggregated({
      name: 'op.run.duration',
      fromTimestamp: 1_700_000_000_000,
      toTimestamp: 1_700_000_060_000,
      bucketSizeMs: BUCKET_MS,
    });
    await datastore.close();
    expect(result.buckets).toHaveLength(1);
    const bucket = result.buckets[0];
    expect(bucket?.sampleCount).toBe(3);
    expect(bucket?.min).toBe(1);
    expect(bucket?.max).toBe(9);
    expect(bucket?.sum).toBe(15);
    expect(bucket?.avg).toBeCloseTo(5);
  });

  test('happy: groups samples across distinct time buckets', async () => {
    const datastore = await useDatastoreForTesting();
    const t0 = 1_700_000_000_000;
    await seed(datastore, [
      { name: 'op.run.duration', value: 1, timestamp: t0 },
      { name: 'op.run.duration', value: 2, timestamp: t0 + 1_000 },
      { name: 'op.run.duration', value: 10, timestamp: t0 + 60_000 },
      { name: 'op.run.duration', value: 20, timestamp: t0 + 90_000 },
    ]);
    const result = await datastore.metrics.queryAggregated({
      name: 'op.run.duration',
      fromTimestamp: t0,
      toTimestamp: t0 + 180_000,
      bucketSizeMs: BUCKET_MS,
    });
    await datastore.close();
    expect(result.buckets).toHaveLength(2);
    expect(result.buckets[0]?.sampleCount).toBe(2);
    expect(result.buckets[0]?.sum).toBe(3);
    expect(result.buckets[1]?.sampleCount).toBe(2);
    expect(result.buckets[1]?.sum).toBe(30);
    expect(result.buckets[1]?.bucketStart).toBeGreaterThan(result.buckets[0]!.bucketStart);
  });

  test('happy: filters by partial dimension match', async () => {
    const datastore = await useDatastoreForTesting();
    const t0 = 1_700_000_000_000;
    await seed(datastore, [
      { name: 'op.run.duration', value: 1, dimensions: { region: 'us', op: 'foo' }, timestamp: t0 },
      { name: 'op.run.duration', value: 2, dimensions: { region: 'us', op: 'bar' }, timestamp: t0 + 1_000 },
      { name: 'op.run.duration', value: 100, dimensions: { region: 'eu', op: 'foo' }, timestamp: t0 + 2_000 },
    ]);
    const result = await datastore.metrics.queryAggregated({
      name: 'op.run.duration',
      fromTimestamp: t0,
      toTimestamp: t0 + 60_000,
      bucketSizeMs: BUCKET_MS,
      dimensions: { region: 'us' },
    });
    await datastore.close();
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0]?.sampleCount).toBe(2);
    expect(result.buckets[0]?.sum).toBe(3);
  });

  test('happy: ignores rows from other metric names', async () => {
    const datastore = await useDatastoreForTesting();
    const t0 = 1_700_000_000_000;
    await seed(datastore, [
      { name: 'op.run.duration', value: 5, timestamp: t0 },
      { name: 'other.metric', value: 999, timestamp: t0 + 100 },
    ]);
    const result = await datastore.metrics.queryAggregated({
      name: 'op.run.duration',
      fromTimestamp: t0,
      toTimestamp: t0 + 60_000,
      bucketSizeMs: BUCKET_MS,
    });
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
      bucketSizeMs: BUCKET_MS,
    });
    await datastore.close();
    expect(result.buckets).toEqual([]);
  });

  test('happy: listNames returns distinct names with summary', async () => {
    const datastore = await useDatastoreForTesting();
    await seed(datastore, [
      { name: 'op.run.duration', value: 1, timestamp: 1000 },
      { name: 'op.run.duration', value: 2, timestamp: 3000 },
      { name: 'op.run.success', value: 1, timestamp: 2000 },
    ]);
    const result = await datastore.metrics.listNames({});
    await datastore.close();
    expect(result.items).toHaveLength(2);
    const dur = result.items.find((i) => i.name === 'op.run.duration');
    expect(dur?.sampleCount).toBe(2);
    expect(dur?.firstSeenAt).toBe(1000);
    expect(dur?.lastSeenAt).toBe(3000);
  });

  test('happy: listVariants returns one row per distinct dimension combo for a metric', async () => {
    const datastore = await useDatastoreForTesting();
    const t0 = 1_700_000_000_000;
    await seed(datastore, [
      { name: 'op.run.duration', value: 1, dimensions: { region: 'us', op: 'foo' }, timestamp: t0 },
      { name: 'op.run.duration', value: 2, dimensions: { region: 'us', op: 'foo' }, timestamp: t0 + 1 },
      { name: 'op.run.duration', value: 3, dimensions: { region: 'eu', op: 'bar' }, timestamp: t0 + 2 },
      { name: 'other.metric', value: 9, dimensions: { region: 'us' }, timestamp: t0 + 3 },
    ]);
    const result = await datastore.metrics.listVariants({ name: 'op.run.duration' });
    await datastore.close();
    expect(result.items).toHaveLength(2);
    const top = result.items[0];
    expect(top?.dimensions).toEqual({ region: 'us', op: 'foo' });
    expect(top?.sampleCount).toBe(2);
    expect(top?.lastSeenAt).toBe(t0 + 1);
    const second = result.items[1];
    expect(second?.dimensions).toEqual({ region: 'eu', op: 'bar' });
    expect(second?.sampleCount).toBe(1);
  });

  test('sad: rejects non-positive bucketSizeMs', async () => {
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
