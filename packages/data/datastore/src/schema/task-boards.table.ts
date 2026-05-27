import { index, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A task board is the top-level container for a hierarchy of pools and tasks.
 * Each board has a user-facing name and is referenced from every pool, task,
 * and dependency record so the daemon can rebuild the in-memory engine on boot.
 */
export const taskBoardsTable = customTable(
  'task_boards',
  {
    projectId: text('project_id').notNull(),

    // The user-facing label for this board.
    name: text('name').notNull(),

    // Optional id of a task_templates row applied to new tasks created on this
    // board when the caller does not provide a templateId. `null` means no
    // default — tasks are still creatable, just without template-derived
    // deliverables.
    defaultTemplateId: text('default_template_id'),
  },
  (table) => [index('task_boards_project_id_idx').on(table.projectId)],
);
