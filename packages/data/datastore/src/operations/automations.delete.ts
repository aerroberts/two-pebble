import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function automationsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database.delete(ctx.schema.automationsTable).where(eq(ctx.schema.automationsTable.id, input.id)).run();
    return { id: input.id };
  };
}
