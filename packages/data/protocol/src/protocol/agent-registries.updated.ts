import type { AgentRegistryKind, TipTapDocument } from '@two-pebble/datatypes';

interface AgentRegistryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  kind: AgentRegistryKind;
  inferenceProfileId: string | null;
  thirdPartyAgentInstallId: string | null;
  systemPrompt: TipTapDocument;
  quickActionEnabled: boolean;
  capabilities: string;
  workspaceConfig: string;
}

/**
 * Defines the AgentRegistriesUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentRegistriesUpdatedEvent {
  name: 'agentRegistryUpdated';
  payload: AgentRegistryRecord;
}
