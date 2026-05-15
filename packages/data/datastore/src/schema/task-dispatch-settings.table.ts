import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Per-scope automation rules for a board or pool.
 * `scope_kind` + `scope_id` identifies the target; a missing row means the
 * scope has the default (concurrency=0, mode=manual).
 */
export const taskDispatchSettingsTable = customTable('task_dispatch_settings', {
  // 'board' or 'pool' — discriminates `scopeId` so the same id space can serve both.
  scopeKind: text('scope_kind').notNull(),
  // The board id or pool id this row governs.
  scopeId: text('scope_id').notNull(),
  // Max concurrent in-progress tasks (working|waiting) the dispatcher will allow within scope.
  concurrency: integer('concurrency').notNull().default(0),
  // 'manual' (no auto-dispatch) or 'automatic' (dispatch up to concurrency using the auto agent).
  dispatchMode: text('dispatch_mode').notNull().default('manual'),
  // Agent registry to launch from when mode = 'automatic'.
  autoAgentRegistryId: text('auto_agent_registry_id'),
});
