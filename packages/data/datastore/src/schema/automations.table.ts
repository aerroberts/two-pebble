import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const automationsTable = customTable('automations', {
  name: text('name').notNull(),
  agentRegistryId: text('agent_registry_id').notNull(),
  // Project this automation belongs to. Nullable so existing rows stay
  // unassigned until a project is chosen in the UI; the launch flow falls
  // back to the default project when this is null.
  projectId: text('project_id'),
  message: text('message').notNull().default(''),
  intervalUnit: text('interval_unit', { enum: ['manual', 'minutes', 'hours', 'days'] }).notNull(),
  intervalValue: integer('interval_value').notNull().default(0),
  lastRanAt: integer('last_ran_at', { mode: 'number' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
});
