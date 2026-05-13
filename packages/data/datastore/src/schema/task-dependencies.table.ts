import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A task dependency joins two entities (tasks or pools) on the same board.
 * `fromId` is blocked by `toId` until `toId` resolves; the in-memory engine
 * rejects sibling violations and cycles so this row is always a valid edge.
 */
export const taskDependenciesTable = customTable('task_dependencies', {
  // Board both endpoints belong to.
  boardId: text('board_id').notNull(),
  // The dependent (blocked) entity id.
  fromId: text('from_id').notNull(),
  // The provider (must-resolve-first) entity id.
  toId: text('to_id').notNull(),
});
