import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation automations', () => {
  test('happy: creates, lists, updates, records runs, and deletes automations', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.automations.create({
      agentRegistryId: 'registry-1',
      enabled: true,
      intervalUnit: 'minutes',
      intervalValue: 15,
      message: 'Run diagnostics',
      name: 'Diagnostics',
    });

    const listed = await datastore.automations.list({ limit: 10, offset: 0 });
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]).toMatchObject({ id: created.id, name: 'Diagnostics', intervalValue: 15 });

    const updated = await datastore.automations.update({
      enabled: false,
      id: created.id,
      intervalUnit: 'manual',
      name: 'Manual diagnostics',
    });
    expect(updated).toMatchObject({ enabled: false, intervalUnit: 'manual', name: 'Manual diagnostics' });

    const run = await datastore.automations.recordRun({ id: created.id, ranAt: 1234 });
    expect(run.lastRanAt).toBe(1234);

    await datastore.automations.delete({ id: created.id });
    expect(await datastore.automations.read({ id: created.id })).toBeNull();
    await datastore.close();
  });

  test('happy: filters automations by agent registry', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.automations.create({
      agentRegistryId: 'registry-1',
      enabled: true,
      intervalUnit: 'manual',
      intervalValue: 0,
      message: '',
      name: 'One',
    });
    await datastore.automations.create({
      agentRegistryId: 'registry-2',
      enabled: true,
      intervalUnit: 'manual',
      intervalValue: 0,
      message: '',
      name: 'Two',
    });

    const listed = await datastore.automations.list({ agentRegistryId: 'registry-1', limit: 10, offset: 0 });
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]?.agentRegistryId).toBe('registry-1');
    await datastore.close();
  });
});

describe('feature: operation heartbeats', () => {
  test('happy: inserts, lists, and prunes heartbeat rows', async () => {
    const datastore = await useDatastoreForTesting();
    const first = await datastore.heartbeats.insert({
      durationMs: 12,
      listenerCount: 1,
      reports: [{ listenerId: 'automation:1', kind: 'automation', outcome: 'skipped', detail: { reason: 'manual' } }],
      tickAt: 100,
    });
    const second = await datastore.heartbeats.insert({
      durationMs: 8,
      listenerCount: 1,
      reports: [{ listenerId: 'automation:2', kind: 'automation', outcome: 'fired', detail: { ran: 1 } }],
      tickAt: 200,
    });

    const listed = await datastore.heartbeats.list({ limit: 10, offset: 0 });
    expect(listed.items.map((row) => row.id)).toEqual([second.id, first.id]);
    expect(listed.items[0]?.reports[0]?.detail).toEqual({ ran: 1 });

    await datastore.heartbeats.prune({ retain: 1 });
    const pruned = await datastore.heartbeats.list({ limit: 10, offset: 0 });
    expect(pruned.items.map((row) => row.id)).toEqual([second.id]);
    await datastore.close();
  });
});
