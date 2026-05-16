import type { DatastoreContext, WorkspaceRecord } from '../types';

type OperationHandlerInput = {
  path: string;
  worktreeId?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function workspacesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.workspacesTable)
      .values({
        path: input.path,
        worktreeId: input.worktreeId ?? null,
      })
      .returning()
      .get();

    return row as WorkspaceRecord;
  };
}
