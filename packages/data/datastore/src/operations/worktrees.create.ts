import type { DatastoreContext, WorktreeRecord } from '../types';

type OperationHandlerInput = {
  branch: string;
  path: string;
  repositoryId: string;
};

/**
 * Inserts a worktree row in the `creating` lifecycle state.
 * The daemon flips this to `active` once `git worktree add` completes,
 * or to `deleted` if the operation fails or the worktree is reclaimed.
 */
export function worktreesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.worktreesTable)
      .values({
        branch: input.branch,
        path: input.path,
        repositoryId: input.repositoryId,
        status: 'creating',
      })
      .returning()
      .get();

    return row as WorktreeRecord;
  };
}
