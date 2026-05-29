import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Removes a memory collection row. This is a hard delete of the pointer
 * only — the on-disk folder is always kept, matching repository delete.
 */
export function memoriesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database.delete(ctx.schema.memoriesTable).where(eq(ctx.schema.memoriesTable.id, input.id)).run();

    return { id: input.id };
  };
}
