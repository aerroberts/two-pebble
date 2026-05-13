import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A task lives on exactly one board, optionally inside a pool.
 * The `status` column persists the engine's stored status (`pending`, `working`,
 * `waiting`, `success`, `failure`); the effective status (blocked/open) is
 * always derived at read time from the dependency graph.
 */
export const tasksTable = customTable('tasks', {
  // Board this task belongs to.
  boardId: text('board_id').notNull(),
  // Containing pool, or null when the task lives at board root.
  poolId: text('pool_id'),
  // Human-readable label.
  name: text('name').notNull(),
  // Free-form description shown in the detail panel.
  description: text('description').notNull().default(''),
  // Agent currently responsible for this task, or null when unassigned.
  ownerId: text('owner_id'),
  // Persisted stored status from the tasks engine.
  status: text('status').notNull(),
});
