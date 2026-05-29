import { index, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A memory collection: a project-scoped pointer to a folder of markdown
 * files on disk. The datastore stores only the row (pointer + metadata) —
 * file contents live on disk and are owned by the daemon, mirroring the
 * repositories↔worktrees split. `path` is stored at creation so historical
 * rows are insulated from default path derivation changes.
 */
export const memoriesTable = customTable(
  'memories',
  {
    projectId: text('project_id').notNull(),
    name: text('name').notNull(),
    path: text('path').notNull(),
  },
  (table) => [index('memories_project_id_idx').on(table.projectId)],
);
