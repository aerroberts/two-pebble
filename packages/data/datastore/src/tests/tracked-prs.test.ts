import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

const trackedPrInput = {
  agentId: 'agent-1',
  deliverableId: 'deliverable-1',
  integrationId: 'integration-1',
  number: 194,
  repo: 'aerroberts/two-pebble',
  taskId: 'task-1',
  url: 'https://github.com/aerroberts/two-pebble/pull/194',
};

describe('feature: operation tracked-prs.upsert', () => {
  test('happy: inserts and idempotently updates by repo and number', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.trackedPrs.upsert(trackedPrInput);
    const updated = await datastore.trackedPrs.upsert({
      ...trackedPrInput,
      state: 'unmergeable',
    });
    await datastore.close();

    expect(updated.id).toBe(created.id);
    expect(updated.state).toBe('unmergeable');
  });
});

describe('feature: operation tracked-prs.read', () => {
  test('happy: reads a tracked PR', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.trackedPrs.upsert(trackedPrInput);
    const read = await datastore.trackedPrs.read({ id: created.id });
    await datastore.close();

    expect(read).toMatchObject({
      id: created.id,
      repo: 'aerroberts/two-pebble',
      state: 'mergeable',
    });
  });
});

describe('feature: operation tracked-prs.update', () => {
  test('happy: updates state, checks, event time, and etag', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.trackedPrs.upsert(trackedPrInput);
    const updated = await datastore.trackedPrs.update({
      checks: [
        {
          conclusion: 'success',
          name: 'Guard And Checks',
          status: 'completed',
          url: 'https://github.com/aerroberts/two-pebble/actions/runs/1',
        },
      ],
      etag: 'etag-1',
      id: created.id,
      lastEventAt: 123,
      state: 'merged',
    });
    await datastore.close();

    expect(updated).toMatchObject({
      checks: [
        {
          conclusion: 'success',
          name: 'Guard And Checks',
          status: 'completed',
          url: 'https://github.com/aerroberts/two-pebble/actions/runs/1',
        },
      ],
      etag: 'etag-1',
      lastEventAt: 123,
      state: 'merged',
    });
  });
});

describe('feature: operation tracked-prs.list', () => {
  test('happy: filters tracked PRs by task and state', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.trackedPrs.upsert(trackedPrInput);
    await datastore.trackedPrs.upsert({
      ...trackedPrInput,
      deliverableId: 'deliverable-2',
      number: 195,
      state: 'merged',
      url: 'https://github.com/aerroberts/two-pebble/pull/195',
    });
    const list = await datastore.trackedPrs.list({
      state: ['mergeable', 'unmergeable'],
      taskId: 'task-1',
    });
    await datastore.close();

    expect(list.items).toHaveLength(1);
    expect(list.items[0]).toMatchObject({ number: 194, state: 'mergeable' });
  });
});

describe('feature: operation tracked-prs.list-open', () => {
  test('happy: returns only mergeable and unmergeable PRs', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.trackedPrs.upsert(trackedPrInput);
    await datastore.trackedPrs.upsert({
      ...trackedPrInput,
      deliverableId: 'deliverable-2',
      number: 195,
      state: 'unmergeable',
      url: 'https://github.com/aerroberts/two-pebble/pull/195',
    });
    await datastore.trackedPrs.upsert({
      ...trackedPrInput,
      deliverableId: 'deliverable-3',
      number: 196,
      state: 'closed',
      url: 'https://github.com/aerroberts/two-pebble/pull/196',
    });
    const list = await datastore.trackedPrs.listOpen({});
    await datastore.close();

    expect(list.items.map((item) => item.number)).toEqual([194, 195]);
  });
});
