import { index, sqliteTable } from 'drizzle-orm/sqlite-core';

import { defaultColumns } from './default-columns';
import type { CustomTableConfigInput, CustomTableIndexColumns, TableColumns } from './types';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function customTable<TableName extends string, Columns extends TableColumns>(
  name: TableName,
  columns: Columns,
  ...configInput: CustomTableConfigInput
) {
  const config = configInput[0];

  return sqliteTable(
    name,
    {
      ...defaultColumns(name),
      ...columns,
    },
    (table) => [
      index(`${name}_updated_at_idx`).on(table.updatedAt),
      ...(config?.(table as CustomTableIndexColumns) ?? []),
    ],
  );
}
