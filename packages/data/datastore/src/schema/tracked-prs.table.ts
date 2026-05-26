import { index, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Pull requests linked to task deliverables and polled by the GitHub daemon service.
 */
export const trackedPrsTable = customTable(
  'tracked_prs',
  {
    taskId: text('task_id').notNull(),
    deliverableId: text('deliverable_id').notNull(),
    agentId: text('agent_id').notNull(),
    integrationId: text('integration_id').notNull(),
    repo: text('repo').notNull(),
    number: integer('number').notNull(),
    url: text('url').notNull(),
    state: text('state').notNull(),
    checks: text('checks').notNull().default('[]'),
    lastCheckedAt: integer('last_checked_at').notNull(),
    lastEventAt: integer('last_event_at'),
    etag: text('etag'),
  },
  (table) => [
    uniqueIndex('tracked_prs_repo_number_idx').on(table.repo, table.number),
    uniqueIndex('tracked_prs_task_deliverable_idx').on(table.taskId, table.deliverableId),
    index('tracked_prs_state_idx').on(table.state),
    index('tracked_prs_agent_idx').on(table.agentId),
  ],
);
