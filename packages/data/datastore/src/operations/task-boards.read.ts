import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function taskBoardsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.taskBoardsTable)
      .where(eq(ctx.schema.taskBoardsTable.id, input.id))
      .get();
    if (row === undefined) throw new Error(`task board "${input.id}" not found`);
    return row as TaskBoardRecord;
  };
}
