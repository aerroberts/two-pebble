import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function tasksListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.tasksTable)
      .where(eq(ctx.schema.tasksTable.boardId, input.boardId))
      .orderBy(asc(ctx.schema.tasksTable.createdAt))
      .all();
    return { items: rows as TaskRecord[] };
  };
}
