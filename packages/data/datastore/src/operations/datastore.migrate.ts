import { resolve } from 'node:path';
import type { Client } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

export function datastoreMigrateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    await ctx.libsqlClient.execute('PRAGMA journal_mode = WAL');
    await ctx.libsqlClient.execute('PRAGMA busy_timeout = 5000');
    await migrate(ctx.database, { migrationsFolder: resolve(import.meta.dirname, '..', '..', 'migrations') });
    await repairTaskEventsDataColumn(ctx.libsqlClient);
    return undefined;
  };
}

// Migration 0018 originally lacked `--> statement-breakpoint` markers, so
// better-sqlite3 only applied the first ALTER TABLE statement on databases
// that ran the broken file. The breakpoints were added later but those
// databases are stuck without the `data` column; this restores it.
async function repairTaskEventsDataColumn(client: Client): Promise<void> {
  const info = await client.execute("PRAGMA table_info('task_events')");
  if (info.rows.length === 0) {
    return;
  }
  const hasData = info.rows.some((row) => String(row.name) === 'data');
  if (hasData) {
    return;
  }
  await client.execute("ALTER TABLE `task_events` ADD `data` text NOT NULL DEFAULT '{}'");
  await client.execute("UPDATE `task_events` SET `data` = json_object('status', `status`) WHERE `kind` = 'status'");
}
