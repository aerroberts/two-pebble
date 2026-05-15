import { and, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDispatchScopeKind } from '../types';

type OperationHandlerInput = {
  scopeKind: TaskDispatchScopeKind;
  scopeId: string;
};

/**
 * Removes the dispatch settings row for a (scopeKind, scopeId) pair, if one
 * exists. No-op when the row is absent.
 */
export function taskDispatchSettingsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.taskDispatchSettingsTable)
      .where(
        and(
          eq(ctx.schema.taskDispatchSettingsTable.scopeKind, input.scopeKind),
          eq(ctx.schema.taskDispatchSettingsTable.scopeId, input.scopeId),
        ),
      )
      .run();
    return { scopeKind: input.scopeKind, scopeId: input.scopeId };
  };
}
