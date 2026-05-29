import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const projectsTable = customTable('projects', {
  name: text('name').notNull(),
  assistantAgentRegistryId: text('assistant_agent_registry_id'),
  assistantAgentId: text('assistant_agent_id'),
  // Agent registry launched by the document "Send to Agent" button for this project.
  documentRunnerAgentRegistryId: text('document_runner_agent_registry_id'),
  // JSON array of global agent registry ids this project exposes in its dropdowns.
  enabledAgentRegistryIds: text('enabled_agent_registry_ids').notNull().default('[]'),
});
