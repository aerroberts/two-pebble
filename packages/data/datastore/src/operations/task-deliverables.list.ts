import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDeliverableRecord } from '../types';

type OperationHandlerInput = {
  taskId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskDeliverablesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskDeliverablesTable)
      .where(eq(ctx.schema.taskDeliverablesTable.taskId, input.taskId))
      .orderBy(asc(ctx.schema.taskDeliverablesTable.orderIndex), asc(ctx.schema.taskDeliverablesTable.createdAt))
      .all();
    return { items: rows as TaskDeliverableRecord[] };
  };
}
