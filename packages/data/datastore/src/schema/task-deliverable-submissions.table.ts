import { integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const taskDeliverableSubmissionsTable = customTable(
  'task_deliverable_submissions',
  {
    taskId: text('task_id').notNull(),
    deliverableId: text('deliverable_id').notNull(),
    payload: text('payload').notNull(),
    submittedAt: integer('submitted_at').notNull(),
  },
  (table) => [uniqueIndex('task_deliverable_submissions_task_deliverable_idx').on(table.taskId, table.deliverableId)],
);
