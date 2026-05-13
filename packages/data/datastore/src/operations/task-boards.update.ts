import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  name: string;
};

export function taskBoardsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .update(ctx.schema.taskBoardsTable)
      .set({ name: input.name })
      .where(eq(ctx.schema.taskBoardsTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) {
      throw new Error(`task board "${input.id}" not found`);
    }
    return row as TaskBoardRecord;
  };
}
