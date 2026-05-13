import type { AgentRegistryKind } from '@two-pebble/datatypes';

interface AgentRegistryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  kind: AgentRegistryKind;
  inferenceProfileId: string | null;
  thirdPartyAgentInstallId: string | null;
  systemPrompt: string;
  capabilities: string;
  workspaceConfig: string;
}

export interface AgentRegistriesUpdatedEvent {
  name: 'agentRegistryUpdated';
  payload: AgentRegistryRecord;
}
