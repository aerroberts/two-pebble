import { index, real, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Internal application metrics.
 * Each row is a single observation: a hierarchical name, a numeric value, and
 * an arbitrary string-keyed dimension map serialized as JSON. Aggregation is
 * computed at query time so this table grows quickly under load.
 */
export const metricsTable = customTable(
  'metrics',
  {
    name: text('name').notNull(),
    value: real('value').notNull(),
    dimensions: text('dimensions', { mode: 'json' }).notNull().$type<Record<string, string>>(),
  },
  (table) => [index('metrics_name_created_at_idx').on(table.name, table.createdAt)],
);
