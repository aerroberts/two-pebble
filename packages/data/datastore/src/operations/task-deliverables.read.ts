import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDeliverableRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskDeliverablesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.taskDeliverablesTable)
      .where(eq(ctx.schema.taskDeliverablesTable.id, input.id))
      .get();
    if (row === undefined) {
      throw new Error(`task deliverable "${input.id}" not found`);
    }
    return row as TaskDeliverableRecord;
  };
}
