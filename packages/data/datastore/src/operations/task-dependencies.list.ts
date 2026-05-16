import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskDependencyRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskDependenciesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskDependenciesTable)
      .where(eq(ctx.schema.taskDependenciesTable.boardId, input.boardId))
      .orderBy(asc(ctx.schema.taskDependenciesTable.createdAt))
      .all();
    return { items: rows as TaskDependencyRecord[] };
  };
}
