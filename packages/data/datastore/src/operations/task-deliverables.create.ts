import type { DatastoreContext, TaskDeliverableRecord, TaskDeliverableType } from '../types';

type OperationHandlerInput = {
  taskId: string;
  name: string;
  description?: string;
  type: TaskDeliverableType;
  orderIndex?: number;
};

export function taskDeliverablesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskDeliverablesTable)
      .values({
        taskId: input.taskId,
        name: input.name,
        description: input.description ?? '',
        type: input.type,
        orderIndex: input.orderIndex ?? 0,
      })
      .returning()
      .get();
    return row as TaskDeliverableRecord;
  };
}
