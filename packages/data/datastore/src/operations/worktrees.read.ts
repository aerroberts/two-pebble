import { eq } from 'drizzle-orm';
import type { DatastoreContext, WorktreeRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function worktreesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.worktreesTable)
      .where(eq(ctx.schema.worktreesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Worktree not found: ${input.id}`);
    }

    return row as WorktreeRecord;
  };
}
