import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskTemplateRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  name?: string;
  prompt?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskTemplatesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.taskTemplatesTable)
      .where(eq(ctx.schema.taskTemplatesTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`task template "${input.id}" not found`);
    }
    const row = await ctx.database
      .update(ctx.schema.taskTemplatesTable)
      .set({
        name: input.name ?? existing.name,
        prompt: input.prompt ?? existing.prompt,
      })
      .where(eq(ctx.schema.taskTemplatesTable.id, input.id))
      .returning()
      .get();
    return row as TaskTemplateRecord;
  };
}
