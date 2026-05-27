import type { DataCells } from '@two-pebble/pebble';
import { index, integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const agentQueuedMessagesTable = customTable(
  'agent_queued_messages',
  {
    agentId: text('agent_id').notNull(),
    cells: text('cells', { mode: 'json' }).notNull().$type<DataCells>(),
    lastError: text('last_error'),
    sentAt: integer('sent_at', { mode: 'number' }),
    status: text('status', { enum: ['queued', 'sent', 'failed'] })
      .notNull()
      .default('queued'),
  },
  (table) => [index('aqm_agent_status_created_idx').on(table.agentId, table.status, table.createdAt)],
);
