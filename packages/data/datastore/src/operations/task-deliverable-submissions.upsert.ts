import { and, eq } from 'drizzle-orm';
import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext, TaskDeliverableSubmissionRecord } from '../types';

type OperationHandlerInput = {
  taskId: string;
  deliverableId: string;
  payload: string;
  submittedAt?: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskDeliverableSubmissionsUpsertOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const submittedAt = input.submittedAt ?? createUtcNow();
    const existing = await ctx.database
      .select()
      .from(ctx.schema.taskDeliverableSubmissionsTable)
      .where(
        and(
          eq(ctx.schema.taskDeliverableSubmissionsTable.taskId, input.taskId),
          eq(ctx.schema.taskDeliverableSubmissionsTable.deliverableId, input.deliverableId),
        ),
      )
      .get();
    if (existing === undefined) {
      const row = await ctx.database
        .insert(ctx.schema.taskDeliverableSubmissionsTable)
        .values({
          taskId: input.taskId,
          deliverableId: input.deliverableId,
          payload: input.payload,
          submittedAt,
        })
        .returning()
        .get();
      return row as TaskDeliverableSubmissionRecord;
    }
    const row = await ctx.database
      .update(ctx.schema.taskDeliverableSubmissionsTable)
      .set({ payload: input.payload, submittedAt })
      .where(eq(ctx.schema.taskDeliverableSubmissionsTable.id, existing.id))
      .returning()
      .get();
    return row as TaskDeliverableSubmissionRecord;
  };
}
