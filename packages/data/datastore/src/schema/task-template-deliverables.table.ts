import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const taskTemplateDeliverablesTable = customTable('task_template_deliverables', {
  templateId: text('template_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  type: text('type').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
});
