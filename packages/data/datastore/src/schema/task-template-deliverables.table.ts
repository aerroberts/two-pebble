import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const taskTemplateDeliverablesTable = customTable('task_template_deliverables', {
  templateId: text('template_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  type: text('type').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
});
