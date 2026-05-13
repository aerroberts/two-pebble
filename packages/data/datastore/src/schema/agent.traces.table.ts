import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Agents report traces which is what happened over their execution
 * Its a way to track and investigate the behavior of agents.
 */
export const agentTracesTable = customTable('agent_traces', {
  // The agent that generated this trace
  agentId: text('agent_id').notNull(),

  // The order in which the trace was generated
  // This is set by the system on trace emit so we can atomically order them
  orderId: integer('order_id', { mode: 'number' }).notNull(),

  // The type of the trace
  type: text('type').notNull(),

  // The data associated with the trace
  data: text('data', { mode: 'json' }),
});
