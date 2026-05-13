import { eq } from 'drizzle-orm';
import type { DatastoreContext, WorktreeRecord, WorktreeStatus } from '../types';

type OperationHandlerInput = {
  id: string;
  path?: string;
  status?: WorktreeStatus;
};

/**
 * Patches the worktree row.
 * The daemon owns the underlying `git worktree` work and uses this to record
 * the resulting state for realtime broadcast.
 */
export function worktreesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.worktreesTable)
      .where(eq(ctx.schema.worktreesTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Worktree not found: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.worktreesTable)
      .set({
        path: input.path ?? existing.path,
        status: input.status ?? existing.status,
      })
      .where(eq(ctx.schema.worktreesTable.id, input.id))
      .returning()
      .get();

    return row as WorktreeRecord;
  };
}
