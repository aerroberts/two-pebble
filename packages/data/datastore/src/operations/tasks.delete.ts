import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function tasksDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database.delete(ctx.schema.taskEventsTable).where(eq(ctx.schema.taskEventsTable.taskId, input.id)).run();
    await ctx.database
      .delete(ctx.schema.taskDeliverableSubmissionsTable)
      .where(eq(ctx.schema.taskDeliverableSubmissionsTable.taskId, input.id))
      .run();
    await ctx.database
      .delete(ctx.schema.taskDeliverablesTable)
      .where(eq(ctx.schema.taskDeliverablesTable.taskId, input.id))
      .run();
    await ctx.database.delete(ctx.schema.tasksTable).where(eq(ctx.schema.tasksTable.id, input.id)).run();
    return { id: input.id };
  };
}
