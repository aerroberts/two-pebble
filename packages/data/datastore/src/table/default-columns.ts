import { integer, text } from 'drizzle-orm/sqlite-core';

import { createTableId } from './create-table-id';
import { createUtcNow } from './create-utc-now';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function defaultColumns(tableName: string) {
  return {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createTableId(tableName)),
    createdAt: integer('created_at', { mode: 'number' })
      .$defaultFn(() => createUtcNow())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'number' })
      .$defaultFn(() => createUtcNow())
      .$onUpdateFn(() => createUtcNow())
      .notNull(),
  };
}
