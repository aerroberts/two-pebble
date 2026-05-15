import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const automationsTable = customTable('automations', {
  name: text('name').notNull(),
  agentRegistryId: text('agent_registry_id').notNull(),
  message: text('message').notNull().default(''),
  intervalUnit: text('interval_unit', { enum: ['manual', 'minutes', 'hours', 'days'] }).notNull(),
  intervalValue: integer('interval_value').notNull().default(0),
  lastRanAt: integer('last_ran_at', { mode: 'number' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
});
