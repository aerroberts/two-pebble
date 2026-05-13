import { asc } from 'drizzle-orm';
import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

export function taskBoardsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskBoardsTable)
      .orderBy(asc(ctx.schema.taskBoardsTable.createdAt))
      .all();
    return { items: rows as TaskBoardRecord[] };
  };
}
