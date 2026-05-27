import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  projectId?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskBoardsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const query = ctx.database
      .select()
      .from(ctx.schema.taskBoardsTable)
      .orderBy(asc(ctx.schema.taskBoardsTable.createdAt));
    const rows =
      input.projectId === undefined
        ? await query.all()
        : await query.where(eq(ctx.schema.taskBoardsTable.projectId, input.projectId)).all();
    return { items: rows as TaskBoardRecord[] };
  };
}
