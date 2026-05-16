import { index, integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';
import type { HeartbeatReport } from '../types';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const heartbeatsTable = customTable(
  'heartbeats',
  {
    tickAt: integer('tick_at', { mode: 'number' }).notNull(),
    durationMs: integer('duration_ms').notNull(),
    listenerCount: integer('listener_count').notNull(),
    reports: text('reports', { mode: 'json' }).notNull().$type<HeartbeatReport[]>(),
  },
  (table) => [index('heartbeats_tick_at_idx').on(table.tickAt)],
);
