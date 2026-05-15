import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskTemplateDeliverableRecord } from '../types';

type OperationHandlerInput = {
  templateId: string;
};

export function taskTemplateDeliverablesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskTemplateDeliverablesTable)
      .where(eq(ctx.schema.taskTemplateDeliverablesTable.templateId, input.templateId))
      .orderBy(
        asc(ctx.schema.taskTemplateDeliverablesTable.orderIndex),
        asc(ctx.schema.taskTemplateDeliverablesTable.createdAt),
      )
      .all();
    return { items: rows as TaskTemplateDeliverableRecord[] };
  };
}
