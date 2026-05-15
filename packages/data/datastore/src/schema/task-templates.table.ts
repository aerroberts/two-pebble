import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const taskTemplatesTable = customTable('task_templates', {
  boardId: text('board_id').notNull(),
  name: text('name').notNull(),
  prompt: text('prompt').notNull().default(''),
});
