import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Removes the worktree row entirely.
 * Callers should mark the worktree `deleted` first (and reclaim the on-disk
 * worktree) so subscribers see the lifecycle transition before the row drops.
 */
export function worktreesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database.delete(ctx.schema.worktreesTable).where(eq(ctx.schema.worktreesTable.id, input.id)).run();

    return { id: input.id };
  };
}
