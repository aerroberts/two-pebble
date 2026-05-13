import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * An agent registry row is a user-configured agent template.
 * The agent's kind ('pebble' | 'framework') is now derived from which of
 * inferenceProfileId / thirdPartyAgentInstallId is populated rather than
 * being persisted explicitly. Either way, the row carries a workspace
 * config that the launch flow uses to resolve where the agent runs.
 */
export const agentRegistriesTable = customTable('agent_registries', {
  // The user-facing label for this agent configuration.
  name: text('name').notNull(),

  // Reference to the inference profile this agent uses (pebble agents).
  inferenceProfileId: text('inference_profile_id'),

  // Reference to the third-party agent install (framework agents).
  thirdPartyAgentInstallId: text('third_party_agent_install_id'),

  // The system prompt the agent runs with.
  systemPrompt: text('system_prompt').notNull(),

  // JSON list of capability specs the launch flow attaches to the agent.
  // Each entry is `{ id, config }`; ids resolve through the in-tree
  // capability registry. Empty array means the agent runs with no
  // capabilities (the default for new registries).
  capabilities: text('capabilities').notNull().default('[]'),

  // JSON workspace config: { kind: 'absolute', path } | { kind: 'worktree', repositoryId }.
  // Legacy rows persisted as { kind: 'cwd' } or { kind: 'fixed', path } are
  // coerced on read by the daemon's parseWorkspaceConfig helper.
  workspaceConfig: text('workspace_config').notNull().default('{"kind":"cwd"}'),
});
