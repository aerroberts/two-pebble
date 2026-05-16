import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskEventRecord } from '../types';

type OperationHandlerInput = {
  taskId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskEventsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskEventsTable)
      .where(eq(ctx.schema.taskEventsTable.taskId, input.taskId))
      .orderBy(asc(ctx.schema.taskEventsTable.createdAt))
      .all();
    return { items: rows as TaskEventRecord[] };
  };
}
