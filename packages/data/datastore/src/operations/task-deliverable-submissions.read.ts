import { and, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDeliverableSubmissionRecord } from '../types';

type OperationHandlerInput = {
  taskId: string;
  deliverableId: string;
};

export function taskDeliverableSubmissionsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.taskDeliverableSubmissionsTable)
      .where(
        and(
          eq(ctx.schema.taskDeliverableSubmissionsTable.taskId, input.taskId),
          eq(ctx.schema.taskDeliverableSubmissionsTable.deliverableId, input.deliverableId),
        ),
      )
      .get();
    if (row === undefined) {
      return null;
    }
    return row as TaskDeliverableSubmissionRecord;
  };
}
