import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A worktree is a `git worktree` derived from a registered repository.
 * Lifecycle moves through `creating` -> `active`, and is set to `deleted`
 * when the worktree is reclaimed.
 */
export const worktreesTable = customTable('worktrees', {
  // The owning repository row id.
  repositoryId: text('repository_id').notNull(),

  // The branch checked out in the worktree.
  branch: text('branch').notNull(),

  // The absolute filesystem path of the worktree on disk.
  path: text('path').notNull(),

  // Lifecycle state of the worktree.
  status: text('status', { enum: ['creating', 'active', 'deleted'] }).notNull(),
});
