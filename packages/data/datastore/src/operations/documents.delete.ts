import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Soft-deletes the document by stamping `archivedAt`. The row stays on disk
 * so the action is recoverable; default list queries filter it out.
 */
export function documentsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .update(ctx.schema.documentsTable)
      .set({ archivedAt: Date.now() })
      .where(eq(ctx.schema.documentsTable.id, input.id))
      .run();

    return { id: input.id };
  };
}
