import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A document is a durable TipTap JSON tree plus its user-facing name.
 * Markdown conversion happens at the CLI edge; the datastore stores JSON text.
 *
 * `references` is a JSON array of typed back-pointers (e.g. agents that
 * authored or edited the doc). Maintained by the document-writer capability
 * runner on the daemon — the editor UI reads it to show "Written by …" pills.
 */
export const documentsTable = customTable('documents', {
  name: text('name').notNull().default('Untitled'),
  content: text('content').notNull().default('{"type":"doc","content":[]}'),
  references: text('references').notNull().default('[]'),
});
