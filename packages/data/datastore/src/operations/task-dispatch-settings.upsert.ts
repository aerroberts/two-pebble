import { and, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDispatchMode, TaskDispatchScopeKind, TaskDispatchSettingsRecord } from '../types';

type OperationHandlerInput = {
  scopeKind: TaskDispatchScopeKind;
  scopeId: string;
  concurrency: number;
  dispatchMode: TaskDispatchMode;
  autoAgentRegistryId: string | null;
};

type TaskDispatchSettingsRow = Omit<TaskDispatchSettingsRecord, 'dispatchMode' | 'scopeKind'> & {
  dispatchMode: string;
  scopeKind: string;
};

/**
 * Upserts the dispatch settings row for a (scopeKind, scopeId) pair.
 * The unique index on (scope_kind, scope_id) guarantees at most one row per
 * scope. Returns the resulting record.
 */
export function taskDispatchSettingsUpsertOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.taskDispatchSettingsTable)
      .where(
        and(
          eq(ctx.schema.taskDispatchSettingsTable.scopeKind, input.scopeKind),
          eq(ctx.schema.taskDispatchSettingsTable.scopeId, input.scopeId),
        ),
      )
      .get();
    if (existing === undefined) {
      const row = await ctx.database
        .insert(ctx.schema.taskDispatchSettingsTable)
        .values({
          scopeKind: input.scopeKind,
          scopeId: input.scopeId,
          concurrency: input.concurrency,
          dispatchMode: input.dispatchMode,
          autoAgentRegistryId: input.autoAgentRegistryId,
        })
        .returning()
        .get();
      return castRow(row);
    }
    const updated = await ctx.database
      .update(ctx.schema.taskDispatchSettingsTable)
      .set({
        concurrency: input.concurrency,
        dispatchMode: input.dispatchMode,
        autoAgentRegistryId: input.autoAgentRegistryId,
      })
      .where(eq(ctx.schema.taskDispatchSettingsTable.id, existing.id))
      .returning()
      .get();
    return castRow(updated);
  };
}

function castRow(row: TaskDispatchSettingsRow): TaskDispatchSettingsRecord {
  return {
    ...row,
    dispatchMode: row.dispatchMode as TaskDispatchMode,
    scopeKind: row.scopeKind as TaskDispatchScopeKind,
  };
}
