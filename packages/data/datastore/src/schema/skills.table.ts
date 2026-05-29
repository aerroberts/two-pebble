import { index, integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A skill is a long-term, reusable memory/tool: a folder on disk (scripts,
 * source, README) plus this DB record pointing at it. The datastore stores
 * only metadata — `diskFolderPath` is an opaque ABSOLUTE path string. The
 * datastore never reads the folder; only the daemon resolve layer lists it
 * (and only a directory listing, never file bodies).
 *
 * `archivedAt` is a soft-delete timestamp (milliseconds). When non-null the
 * row is hidden from default listings but preserved so it can be restored.
 * The "Delete skill" UX archives via this column instead of a hard DELETE.
 */
export const skillsTable = customTable(
  'skills',
  {
    projectId: text('project_id').notNull(),
    name: text('name').notNull().default('Untitled'),
    description: text('description').notNull().default(''),
    // ABSOLUTE path to the skill folder on disk. No project-level filesystem
    // root exists to make this relative to, so it is stored verbatim.
    diskFolderPath: text('disk_folder_path').notNull(),
    archivedAt: integer('archived_at'),
  },
  (table) => [index('skills_project_id_idx').on(table.projectId)],
);
