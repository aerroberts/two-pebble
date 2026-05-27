import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

export const projectsTable = customTable('projects', {
  name: text('name').notNull(),
  assistantAgentRegistryId: text('assistant_agent_registry_id'),
  assistantAgentId: text('assistant_agent_id'),
});
