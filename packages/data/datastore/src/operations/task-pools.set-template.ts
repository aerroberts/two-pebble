import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskPoolRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  defaultTemplateId: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskPoolsSetTemplateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .update(ctx.schema.taskPoolsTable)
      .set({ defaultTemplateId: input.defaultTemplateId })
      .where(eq(ctx.schema.taskPoolsTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) {
      throw new Error(`task pool "${input.id}" not found`);
    }
    return row as TaskPoolRecord;
  };
}
