import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Agents are the core entities in our system.
 * They are responsible for executing tasks and making decisions.
 */
export const agentsTable = customTable('agents', {
  // The name of the agent
  name: text('name').notNull(),
  description: text('description').notNull(),

  // The workspace the agent operates within. Required.
  workspaceId: text('workspace_id').notNull(),

  // Optional parent agent that spawned this run.
  parentAgentId: text('parent_agent_id'),

  // The agent registry this agent was launched from.
  // Null for legacy agents created before resumability shipped; those agents are read-only.
  agentRegistryId: text('agent_registry_id'),

  // Opaque framework-specific resume metadata serialized as JSON.
  // The daemon does not introspect this; the framework adapter writes and reads it.
  metadata: text('metadata').notNull().default('{}'),

  // The status of the agent
  status: text('status', { enum: ['idle', 'running', 'waiting', 'offline', 'failed'] }).notNull(),

  // The agent lifecycle information itself
  startedAt: integer('started_at', { mode: 'number' }).notNull(),
  completedAt: integer('completed_at', { mode: 'number' }).notNull(),
});
