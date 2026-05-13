import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { Datastore } from '../datastore';

/**
 * Recreates the legacy migration gap and verifies the self-heal path.
 *
 * The helper owns temporary database cleanup for the scenario.
 */
export async function runTaskEventsDataSelfHealScenario() {
  const directory = path.resolve(import.meta.dirname, '..', '..', '.test');
  fs.mkdirSync(directory, { recursive: true });
  const databaseFilePath = path.join(directory, `${crypto.randomUUID()}.sqlite`);
  const datastore = new Datastore({ databaseFilePath });
  await datastore.migrate();
  await removeTaskEventsDataColumn(databaseFilePath);
  await datastore.migrate();
  const result = await datastore.runQuery("SELECT name FROM pragma_table_info('task_events') WHERE name = 'data'");
  const event = await datastore.runQuery("SELECT data FROM task_events WHERE id = 'e1'");
  await datastore.close();
  removeDatabaseFiles(databaseFilePath);
  return { result, event };
}

async function removeTaskEventsDataColumn(databaseFilePath: string) {
  const client = createClient({ url: `file:${databaseFilePath}` });
  await client.execute('ALTER TABLE `task_events` DROP COLUMN `data`');
  await client.execute(
    "INSERT INTO `task_events` (id, created_at, updated_at, task_id, status, reason, kind) VALUES ('e1', 0, 0, 't1', 'working', 'r', 'status')",
  );
  client.close();
}

function removeDatabaseFiles(databaseFilePath: string) {
  fs.rmSync(databaseFilePath, { force: true });
  fs.rmSync(`${databaseFilePath}-shm`, { force: true });
  fs.rmSync(`${databaseFilePath}-wal`, { force: true });
}
