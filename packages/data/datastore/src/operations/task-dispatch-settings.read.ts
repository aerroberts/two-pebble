import { and, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDispatchMode, TaskDispatchScopeKind, TaskDispatchSettingsRecord } from '../types';

type OperationHandlerInput = {
  scopeKind: TaskDispatchScopeKind;
  scopeId: string;
};

/**
 * Returns the dispatch settings row for a (scopeKind, scopeId) pair, or null
 * when no row exists. Callers should treat null as the default
 * `{ concurrency: 0, dispatchMode: 'manual' }` configuration.
 */
export function taskDispatchSettingsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<TaskDispatchSettingsRecord | null> {
    const row = await ctx.database
      .select()
      .from(ctx.schema.taskDispatchSettingsTable)
      .where(
        and(
          eq(ctx.schema.taskDispatchSettingsTable.scopeKind, input.scopeKind),
          eq(ctx.schema.taskDispatchSettingsTable.scopeId, input.scopeId),
        ),
      )
      .get();
    if (row === undefined) {
      return null;
    }
    return castRow(row);
  };
}

function castRow(
  row: { dispatchMode: string; scopeKind: string } & Omit<TaskDispatchSettingsRecord, 'dispatchMode' | 'scopeKind'>,
): TaskDispatchSettingsRecord {
  return {
    ...row,
    dispatchMode: row.dispatchMode as TaskDispatchMode,
    scopeKind: row.scopeKind as TaskDispatchScopeKind,
  };
}
