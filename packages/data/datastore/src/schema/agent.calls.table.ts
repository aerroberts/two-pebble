import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * An agent call is a specific interaction with an LLM model
 * We save these in teh database for lookup purposes.
 */
export const agentCallsTable = customTable('agent_calls', {
  // What agent generated this call
  agentId: text('agent_id').notNull(),

  // The provider of the LLM model
  provider: text('provider').notNull(),
  modelId: text('model_id').notNull(),
  threadCellPointer: text('thread_cell_pointer').notNull(),

  // How the call was processed
  status: text('status', { enum: ['in_progress', 'completed', 'failed'] }).notNull(),
  errorMessage: text('error_message').notNull(),

  // When the call was made and completed
  startedAt: integer('started_at', { mode: 'number' }).notNull(),
  completedAt: integer('completed_at', { mode: 'number' }).notNull(),

  // The specific data blob from the LLM call, including all input and output
  // And also any additional metadata per provider
  data: text('data', { mode: 'json' }).notNull(),
});
