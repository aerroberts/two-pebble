import type { PebbleJsonValue } from '@two-pebble/pebble';
import { index, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const agentSignalsTable = customTable(
  'agent_signals',
  {
    agentId: text('agent_id').notNull(),
    capabilityId: text('capability_id').notNull(),
    data: text('data', { mode: 'json' }).notNull().default('{}').$type<PebbleJsonValue>(),
    description: text('description').notNull(),
    kind: text('kind', { enum: ['awaited', 'push'] }).notNull(),
    name: text('name').notNull(),
    receivedAt: integer('received_at', { mode: 'number' }),
    resolvedAt: integer('resolved_at', { mode: 'number' }),
    signalId: text('signal_id').notNull(),
    status: text('status', { enum: ['open', 'received', 'resolved'] }).notNull(),
  },
  (table) => [
    uniqueIndex('agent_signals_agent_capability_signal_idx').on(table.agentId, table.capabilityId, table.signalId),
    index('agent_signals_agent_status_idx').on(table.agentId, table.status),
  ],
);
