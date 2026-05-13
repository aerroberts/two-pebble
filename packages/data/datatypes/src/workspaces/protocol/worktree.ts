/**
 * Workspace config that boots the agent inside a fresh git worktree spawned
 * off the referenced repository. The launch flow creates the worktree on
 * demand and the agent runs there for its lifetime.
 */
export interface WorkspaceConfig_Worktree {
  kind: 'worktree';
  repositoryId: string;
}
