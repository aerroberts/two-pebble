import type { AgentRegistryKind, TipTapDocument } from '@two-pebble/datatypes';

/**
 * Defines the AgentRegistryRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentRegistryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  /**
   * Discriminator: 'pebble' rows reference an inference profile;
   * 'framework' rows reference a third-party agent install.
   */
  kind: AgentRegistryKind;
  inferenceProfileId: string | null;
  thirdPartyAgentInstallId: string | null;
  systemPrompt: TipTapDocument;
  /**
   * Serialized JSON list of `{ id, config }` capability specs the
   * launch flow attaches to each agent run. UI surfaces this as the
   * Capabilities + Sub-agents sections of the registry editor.
   */
  capabilities: string;
  /**
   * Serialized JSON workspace config. Discriminated union with kind
   * 'cwd' | 'fixed' | 'worktree'. The daemon parses this and resolves the
   * concrete workspace at launch.
   */
  workspaceConfig: string;
}

/**
 * Defines the AgentRegistriesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentRegistriesListOperation {
  name: 'listAgentRegistries';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: AgentRegistryRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
