import os from 'node:os';
import path from 'node:path';

/**
 * Returns the absolute path where the daemon stores worktrees for a repository.
 * Worktrees live under `~/.two-pebble/worktrees/{repoId}/{worktreeId}`.
 */
export function buildWorktreePath(repositoryId: string, worktreeId: string): string {
  return path.join(os.homedir(), '.two-pebble', 'worktrees', repositoryId, worktreeId);
}
