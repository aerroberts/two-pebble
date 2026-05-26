import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function tasksReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.tasksTable)
      .where(eq(ctx.schema.tasksTable.id, input.id))
      .get();
    if (row === undefined) {
      throw new Error(`task "${input.id}" not found`);
    }
    return row as TaskRecord;
  };
}
