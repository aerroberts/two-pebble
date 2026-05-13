import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * A third-party agent install is a record that a particular framework agent
 * binary (e.g. Claude Code) is available on this machine. Multiple installs
 * for the same frameworkId are allowed; each install holds its own name and
 * launch metadata (such as the executable path).
 */
export const thirdPartyAgentInstallsTable = customTable('third_party_agent_installs', {
  // The framework this install belongs to (e.g. 'claude-code').
  frameworkId: text('framework_id').notNull(),

  // The user-facing name for this install.
  name: text('name').notNull(),

  // What launch metadata is associated with this install (e.g. executablePath).
  data: text('data', { mode: 'json' }).notNull(),
});
