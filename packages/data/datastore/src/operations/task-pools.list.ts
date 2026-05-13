import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskPoolRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
};

export function taskPoolsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskPoolsTable)
      .where(eq(ctx.schema.taskPoolsTable.boardId, input.boardId))
      .orderBy(asc(ctx.schema.taskPoolsTable.createdAt))
      .all();
    return { items: rows as TaskPoolRecord[] };
  };
}
