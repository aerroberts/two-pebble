import type { TipTapDocument } from '@two-pebble/datatypes';

/**
 * Defines the AgentRegistriesUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentRegistriesUpdateOperation {
  name: 'updateAgentRegistry';
  request: {
    capabilities?: string;
    id: string;
    inferenceProfileId?: string | null;
    name?: string;
    systemPrompt?: TipTapDocument;
    thirdPartyAgentInstallId?: string | null;
    workspaceConfig?: string;
  };
  response: {
    id: string;
  };
}
