import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDeliverableSubmissionRecord } from '../types';

type OperationHandlerInput = {
  taskId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskDeliverableSubmissionsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskDeliverableSubmissionsTable)
      .where(eq(ctx.schema.taskDeliverableSubmissionsTable.taskId, input.taskId))
      .orderBy(asc(ctx.schema.taskDeliverableSubmissionsTable.submittedAt))
      .all();
    return { items: rows as TaskDeliverableSubmissionRecord[] };
  };
}
