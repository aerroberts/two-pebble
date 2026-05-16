import type { TipTapDocument } from '@two-pebble/datatypes';

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
