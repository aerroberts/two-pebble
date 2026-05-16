import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const taskTemplatesTable = customTable('task_templates', {
  boardId: text('board_id').notNull(),
  name: text('name').notNull(),
  prompt: text('prompt').notNull().default(''),
});
