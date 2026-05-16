import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.inferenceProfilesTable)
      .where(eq(ctx.schema.inferenceProfilesTable.id, input.id))
      .run();
    return { id: input.id };
  };
}
