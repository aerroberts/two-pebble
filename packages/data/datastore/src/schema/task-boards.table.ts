import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A task board is the top-level container for a hierarchy of pools and tasks.
 * Each board has a user-facing name and is referenced from every pool, task,
 * and dependency record so the daemon can rebuild the in-memory engine on boot.
 */
export const taskBoardsTable = customTable('task_boards', {
  // The user-facing label for this board.
  name: text('name').notNull(),
});
