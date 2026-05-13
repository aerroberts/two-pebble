import type { DatastoreContext, TaskEventRecord } from '../types';

type OperationHandlerInput = {
  taskId: string;
  kind: string;
  status: string;
  reason: string;
  data: string;
};

export function taskEventsRecordOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskEventsTable)
      .values({
        taskId: input.taskId,
        kind: input.kind,
        status: input.status,
        reason: input.reason,
        data: input.data,
      })
      .returning()
      .get();
    return row as TaskEventRecord;
  };
}
