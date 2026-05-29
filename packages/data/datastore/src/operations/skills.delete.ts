import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Soft-deletes the skill by stamping `archivedAt`. The row stays on disk so
 * the action is recoverable; default list queries filter it out. The folder
 * on disk is never touched.
 */
export function skillsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .update(ctx.schema.skillsTable)
      .set({ archivedAt: Date.now() })
      .where(eq(ctx.schema.skillsTable.id, input.id))
      .run();

    return { id: input.id };
  };
}
