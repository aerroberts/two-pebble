export interface AgentRegistriesCreateOperation {
  name: 'createAgentRegistry';
  request: {
    capabilities?: string;
    inferenceProfileId?: string | null;
    name: string;
    systemPrompt: string;
    thirdPartyAgentInstallId?: string | null;
    workspaceConfig?: string;
  };
  response: {
    id: string;
  };
}
