type WorktreeStatus = 'creating' | 'active' | 'deleted';

interface WorktreeRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  repositoryId: string;
  branch: string;
  path: string;
  status: WorktreeStatus;
}

/**
 * Daemon-managed worktree creation.
 * The daemon inserts the row in `creating`, runs `git worktree add`, and
 * resolves to the active record once the on-disk worktree is ready. Lifecycle
 * transitions are also broadcast as `worktreeUpdated` events so subscribers can
 * track progress.
 */
export interface WorktreesCreateOperation {
  name: 'createWorktree';
  request: {
    branch: string;
    repositoryId: string;
  };
  response: WorktreeRecord;
}
