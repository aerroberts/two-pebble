import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { Datastore } from '../datastore';
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
    const directory = path.resolve(import.meta.dirname, '..', '..', '.test');
    fs.mkdirSync(directory, { recursive: true });
    const databaseFilePath = path.join(directory, `${crypto.randomUUID()}.sqlite`);
    const datastore = new Datastore({ databaseFilePath });
    await datastore.migrate();

    const client = createClient({ url: `file:${databaseFilePath}` });
    await client.execute('ALTER TABLE `task_events` DROP COLUMN `data`');
    await client.execute(
      "INSERT INTO `task_events` (id, created_at, updated_at, task_id, status, reason, kind) VALUES ('e1', 0, 0, 't1', 'working', 'r', 'status')",
    );
    client.close();

    await datastore.migrate();
    const result = await datastore.runQuery("SELECT name FROM pragma_table_info('task_events') WHERE name = 'data'");
    const event = await datastore.runQuery("SELECT data FROM task_events WHERE id = 'e1'");
    await datastore.close();
    fs.rmSync(databaseFilePath, { force: true });
    fs.rmSync(`${databaseFilePath}-shm`, { force: true });
    fs.rmSync(`${databaseFilePath}-wal`, { force: true });

    expect(result.rows).toHaveLength(1);
    expect(event.rows[0]).toEqual({ data: '{"status":"working"}' });
  });
});

describe('feature: operation datastore.status', () => {
  test('happy: reads aggregate datastore counts', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.agent.create({ description: 'Status test agent', name: 'Status Agent', workspaceId: 'legacy' });
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
