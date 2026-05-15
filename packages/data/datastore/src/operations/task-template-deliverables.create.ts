import type { DatastoreContext, TaskDeliverableType, TaskTemplateDeliverableRecord } from '../types';

type OperationHandlerInput = {
  templateId: string;
  name: string;
  description?: string;
  type: TaskDeliverableType;
  orderIndex?: number;
};

export function taskTemplateDeliverablesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskTemplateDeliverablesTable)
      .values({
        templateId: input.templateId,
        name: input.name,
        description: input.description ?? '',
        type: input.type,
        orderIndex: input.orderIndex ?? 0,
      })
      .returning()
      .get();
    return row as TaskTemplateDeliverableRecord;
  };
}
