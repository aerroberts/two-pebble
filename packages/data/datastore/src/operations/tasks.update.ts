import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  status?: string;
  templateId?: string | null;
  additionalContext?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function tasksUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.tasksTable)
      .where(eq(ctx.schema.tasksTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`task "${input.id}" not found`);
    }
    const row = await ctx.database
      .update(ctx.schema.tasksTable)
      .set({
        status: input.status ?? existing.status,
        templateId: input.templateId === undefined ? existing.templateId : input.templateId,
        additionalContext: input.additionalContext ?? existing.additionalContext,
      })
      .where(eq(ctx.schema.tasksTable.id, input.id))
      .returning()
      .get();
    return row as TaskRecord;
  };
}
