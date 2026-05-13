/**
 * Emitted when the daemon finishes provisioning a worktree for an agent launch.
 * UI surfaces this trace with an action that opens the worktree directory.
 */
export interface PebbleAgentWorktreeInitializedTrace {
  type: 'worktree-initialized';
  data: {
    branch: string;
    path: string;
    repositoryId: string;
    worktreeId: string;
  };
}
