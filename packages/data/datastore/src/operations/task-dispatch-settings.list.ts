import { asc } from 'drizzle-orm';
import type { DatastoreContext, TaskDispatchMode, TaskDispatchScopeKind, TaskDispatchSettingsRecord } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

/**
 * Lists every dispatch settings row. Useful for the dispatcher's boot sweep
 * and for surfacing automation badges across the UI.
 */
export function taskDispatchSettingsListOperation(ctx: DatastoreContext) {
  return async function handler(_input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskDispatchSettingsTable)
      .orderBy(asc(ctx.schema.taskDispatchSettingsTable.createdAt))
      .all();
    return { items: rows.map(castRow) };
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
