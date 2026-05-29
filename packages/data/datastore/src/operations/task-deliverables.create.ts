import { desc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDeliverableRecord, TaskDeliverableType } from '../types';

type OperationHandlerInput = {
  taskId: string;
  name: string;
  description?: string;
  type: TaskDeliverableType;
  orderIndex?: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskDeliverablesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const table = ctx.schema.taskDeliverablesTable;
    const latest = await ctx.database
      .select({ orderIndex: table.orderIndex })
      .from(table)
      .where(eq(table.taskId, input.taskId))
      .orderBy(desc(table.orderIndex))
      .limit(1)
      .get();
    const orderIndex = input.orderIndex ?? (latest === undefined ? 0 : latest.orderIndex + 1);
    const row = await ctx.database
      .insert(table)
      .values({
        taskId: input.taskId,
        name: input.name,
        description: input.description ?? '',
        type: input.type,
        orderIndex,
      })
      .returning()
      .get();
    return row as TaskDeliverableRecord;
  };
}
