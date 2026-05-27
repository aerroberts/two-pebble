import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const knownIdesTable = customTable('known_ides', {
  kind: text('kind').notNull(),
  displayName: text('display_name').notNull(),
  executablePath: text('executable_path').notNull(),
});
