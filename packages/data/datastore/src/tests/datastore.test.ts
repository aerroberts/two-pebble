import { describe, expect, test } from 'bun:test';
import { runTaskEventsDataSelfHealScenario } from '../testing/datastore-migration-test-env';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation datastore.close', () => {
  test('happy: closes the sqlite connection', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.close();
    expect(true).toBe(true);
  });
});

describe('feature: operation datastore.migrate', () => {
  test('happy: applies migrations to the database', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.migrate();
    const status = await datastore.status();
    await datastore.close();
    expect(status.databaseFilePath).toEndWith('.sqlite');
  });
});

describe('feature: operation datastore.migrate self-heal', () => {
  test('happy: re-adds task_events.data when the broken 0018 migration left it off', async () => {
    const { result, event } = await runTaskEventsDataSelfHealScenario();
    expect(result.rows).toHaveLength(1);
    expect(event.rows[0]).toEqual({ data: '{"status":"working"}' });
  });
});

describe('feature: operation datastore.status', () => {
  test('happy: reads aggregate datastore counts', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.agent.create({
      description: 'Status test agent',
      name: 'Status Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    await datastore.integrations.create({
      data: { apiKey: 'sk-status' },
      name: 'OpenAI',
      provider: 'openai',
    });
    const status = await datastore.status();
    await datastore.close();
    expect(status).toMatchObject({ agentCount: 1, integrationCount: 1 });
  });
});
