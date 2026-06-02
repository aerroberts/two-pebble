import { index, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

type TrackedPrState = 'mergeable' | 'pending' | 'unmergeable' | 'merged' | 'closed';

type TrackedPrCheckRun = {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  url: string;
};

export const trackedPrsTable = customTable(
  'tracked_prs',
  {
    taskId: text('task_id').notNull(),
    deliverableId: text('deliverable_id').notNull(),
    // Vestigial: GitHub access now goes through the local `gh` CLI, so no
    // integration token is read. Retained (written as '') to avoid a schema
    // migration; safe to drop in a dedicated migration later.
    integrationId: text('integration_id').notNull(),
    repo: text('repo').notNull(),
    number: integer('number').notNull(),
    // PR title from `gh`, refreshed on every poll. Drives the overview's
    // "copy for review" output.
    title: text('title').notNull().default(''),
    url: text('url').notNull(),
    state: text('state', { enum: ['mergeable', 'pending', 'unmergeable', 'merged', 'closed'] })
      .notNull()
      .$type<TrackedPrState>(),
    checks: text('checks', { mode: 'json' }).notNull().default('[]').$type<TrackedPrCheckRun[]>(),
    lastCheckedAt: integer('last_checked_at', { mode: 'number' }).notNull(),
    lastEventAt: integer('last_event_at', { mode: 'number' }),
    // Vestigial: ETag conditional requests were a REST-API optimization; the
    // `gh` CLI does not use them. Never written now.
    etag: text('etag'),
  },
  (table) => [
    uniqueIndex('tracked_prs_repo_number_idx').on(table.repo, table.number),
    uniqueIndex('tracked_prs_task_deliverable_idx').on(table.taskId, table.deliverableId),
    index('tracked_prs_state_idx').on(table.state),
  ],
);
