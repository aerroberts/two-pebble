import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  name?: string;
  /**
   * `undefined` leaves the column alone; an explicit `null` clears the
   * default template; a string sets it. Lets callers PATCH the name or the
   * default template independently.
   */
  defaultTemplateId?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskBoardsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const patch: { name?: string; defaultTemplateId?: string | null } = {};
    if (input.name !== undefined) {
      patch.name = input.name;
    }
    if (input.defaultTemplateId !== undefined) {
      patch.defaultTemplateId = input.defaultTemplateId;
    }
    const row = await ctx.database
      .update(ctx.schema.taskBoardsTable)
      .set(patch)
      .where(eq(ctx.schema.taskBoardsTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) {
      throw new Error(`task board "${input.id}" not found`);
    }
    return row as TaskBoardRecord;
  };
}
