import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A document is a durable TipTap JSON tree plus its user-facing name.
 * Markdown conversion happens at the CLI edge; the datastore stores JSON text.
 */
export const documentsTable = customTable('documents', {
  name: text('name').notNull().default('Untitled'),
  content: text('content').notNull().default('{"type":"doc","content":[]}'),
});
