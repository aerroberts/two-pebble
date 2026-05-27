import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  name: string;
  projectId?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskBoardsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskBoardsTable)
      .values({ name: input.name, projectId: input.projectId ?? 'proj_default' })
      .returning()
      .get();
    return row as TaskBoardRecord;
  };
}
