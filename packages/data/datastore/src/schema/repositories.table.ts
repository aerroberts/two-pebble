import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A repository is a pointer to an existing local git clone.
 * Worktrees are derived from a repository for isolated agent work.
 */
export const repositoriesTable = customTable('repositories', {
  // The user-facing label for this repository.
  name: text('name').notNull(),

  // The absolute filesystem path to the existing local clone.
  path: text('path').notNull(),

  // The base branch new worktrees are cut from by default.
  baseBranch: text('base_branch').notNull(),
});
