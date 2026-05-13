/**
 * Marks the worktree `deleted`, removes the on-disk worktree, and broadcasts
 * the resulting status transition. The row remains so deleted worktrees can
 * be listed for audit until the user explicitly purges them.
 */
export interface WorktreesDeleteOperation {
  name: 'deleteWorktree';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
