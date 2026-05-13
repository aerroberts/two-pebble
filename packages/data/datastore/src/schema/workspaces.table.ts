import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A workspace is a path on disk where an agent can operate.
 * It optionally references a worktree; standalone workspaces (e.g. arbitrary
 * filesystem paths for CLI launches) leave `worktreeId` null.
 */
export const workspacesTable = customTable('workspaces', {
  // The absolute filesystem path the agent operates within.
  path: text('path').notNull(),

  // Optional worktree this workspace is backed by.
  worktreeId: text('worktree_id'),
});
