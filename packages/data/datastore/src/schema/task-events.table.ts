import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A task event records one observed status transition.
 * The engine derives effective status; this table preserves the natural-language
 * reason that motivated the change (or the synthesized reason when the change
 * cascaded automatically through the dependency graph).
 */
export const taskEventsTable = customTable('task_events', {
  // Task this event belongs to.
  taskId: text('task_id').notNull(),
  // Discriminator: 'status' | 'delegated' | 'undelegated' | future kinds.
  kind: text('kind').notNull().default('status'),
  // Effective status the task transitioned into; only meaningful for kind='status'.
  status: text('status').notNull(),
  // Free-form reason (caller-provided or engine-synthesized).
  reason: text('reason').notNull(),
  // Kind-specific JSON payload (agent ids, registry ids, etc.).
  data: text('data').notNull().default('{}'),
});
