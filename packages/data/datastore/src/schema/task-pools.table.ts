import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A task pool groups tasks (and other pools) under a board.
 * `parentPoolId` is null for pools that live at board root and otherwise
 * names another pool on the same board to form the containment tree.
 */
export const taskPoolsTable = customTable('task_pools', {
  // Board this pool belongs to.
  boardId: text('board_id').notNull(),
  // Containing pool, or null for board-root pools.
  parentPoolId: text('parent_pool_id'),
  // Human-readable label.
  name: text('name').notNull(),
});
