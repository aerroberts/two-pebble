import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { DatastoreContext } from '../types';
import { convertLegacyAgentSystemPrompts, repairTaskEventsDataColumn } from '../utils/datastore-migrate-utils';

type OperationHandlerInput = {
  empty?: never;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
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
