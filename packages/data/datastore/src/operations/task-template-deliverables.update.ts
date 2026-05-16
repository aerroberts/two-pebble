import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDeliverableType, TaskTemplateDeliverableRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  name?: string;
  description?: string;
  type?: TaskDeliverableType;
  orderIndex?: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskTemplateDeliverablesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.taskTemplateDeliverablesTable)
      .where(eq(ctx.schema.taskTemplateDeliverablesTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`task template deliverable "${input.id}" not found`);
    }
    const row = await ctx.database
      .update(ctx.schema.taskTemplateDeliverablesTable)
      .set({
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        type: input.type ?? (existing.type as TaskDeliverableType),
        orderIndex: input.orderIndex ?? existing.orderIndex,
      })
      .where(eq(ctx.schema.taskTemplateDeliverablesTable.id, input.id))
      .returning()
      .get();
    return row as TaskTemplateDeliverableRecord;
  };
}
