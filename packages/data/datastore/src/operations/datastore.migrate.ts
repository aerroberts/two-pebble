import { resolve } from 'node:path';
import type { Client } from '@libsql/client';
import { agentSystemPromptFromText } from '@two-pebble/datatypes';
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
    await convertLegacyAgentSystemPrompts(ctx.libsqlClient);
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

/**
 * Migration 0044 changes the agent_registries.system_prompt column to
 * hold canonical TipTap JSON. Existing rows persist plain markdown
 * strings which would still parse fine on read (the parser wraps them
 * into a flat doc) but tools that introspect the DB expect JSON.
 * Rewrites any legacy row in place. Idempotent — JSON values pass
 * through unchanged.
 */
async function convertLegacyAgentSystemPrompts(client: Client): Promise<void> {
  const info = await client.execute("PRAGMA table_info('agent_registries')");
  if (info.rows.length === 0) {
    return;
  }
  const rows = await client.execute('SELECT `id`, `system_prompt` FROM `agent_registries`');
  for (const row of rows.rows) {
    const id = row.id;
    const raw = row.system_prompt;
    if (typeof id !== 'string' || typeof raw !== 'string') {
      continue;
    }
    if (raw.startsWith('{')) {
      continue;
    }
    const doc = agentSystemPromptFromText(raw);
    await client.execute({
      sql: 'UPDATE `agent_registries` SET `system_prompt` = ? WHERE `id` = ?',
      args: [JSON.stringify(doc), id],
    });
  }
}
