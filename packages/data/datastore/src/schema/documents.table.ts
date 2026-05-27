import { index, integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A document is a durable TipTap JSON tree plus its user-facing name.
 * Markdown conversion happens at the CLI edge; the datastore stores JSON text.
 *
 * `references` is a JSON array of typed back-pointers (e.g. agents that
 * authored or edited the doc). Maintained by the document-writer capability
 * runner on the daemon — the editor UI reads it to show "Written by …" pills.
 *
 * `archivedAt` is a soft-delete timestamp (milliseconds). When non-null the
 * row is hidden from default listings but preserved on disk so it can be
 * restored. The "Delete document" UX archives via this column instead of a
 * hard DELETE.
 */
export const documentsTable = customTable(
  'documents',
  {
    projectId: text('project_id').notNull(),
    name: text('name').notNull().default('Untitled'),
    content: text('content').notNull().default('{"type":"doc","content":[]}'),
    references: text('references').notNull().default('[]'),
    archivedAt: integer('archived_at'),
    // Free-form section / folder label used to group documents in the sidebar.
    // `null` means the document lives in the default "Documents" bucket. The
    // value is the section's display label — no separate sections table — so
    // creating a new section is just typing a new string.
    section: text('section'),
  },
  (table) => [index('documents_project_id_idx').on(table.projectId)],
);
