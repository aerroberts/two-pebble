import { index, integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const agentConversationCellsTable = customTable(
  'agent_conversation_cells',
  {
    agentId: text('agent_id').notNull(),
    orderId: integer('order_id', { mode: 'number' }).notNull(),
    content: text('content', { mode: 'json' }).notNull(),
    label: text('label').notNull().default(''),
    role: text('role', { enum: ['user', 'assistant', 'cache', 'system'] })
      .notNull()
      .default('user'),
    threadId: text('thread_id').notNull(),
  },
  (table) => [index('agent_conversation_cells_thread_order_idx').on(table.threadId, table.orderId)],
);
