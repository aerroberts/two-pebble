import { integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const taskDeliverablesTable = customTable(
  'task_deliverables',
  {
    taskId: text('task_id').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    type: text('type').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
  },
  (table) => [uniqueIndex('task_deliverables_task_order_idx').on(table.taskId, table.orderIndex)],
);
