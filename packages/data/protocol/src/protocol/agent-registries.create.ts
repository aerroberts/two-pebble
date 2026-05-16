import type { TipTapDocument } from '@two-pebble/datatypes';

export interface AgentRegistriesCreateOperation {
  name: 'createAgentRegistry';
  request: {
    capabilities?: string;
    inferenceProfileId?: string | null;
    name: string;
    systemPrompt: TipTapDocument;
    thirdPartyAgentInstallId?: string | null;
    workspaceConfig?: string;
  };
  response: {
    id: string;
  };
}
