export interface AgentRegistriesUpdateOperation {
  name: 'updateAgentRegistry';
  request: {
    capabilities?: string;
    id: string;
    inferenceProfileId?: string | null;
    name?: string;
    systemPrompt?: string;
    thirdPartyAgentInstallId?: string | null;
    workspaceConfig?: string;
  };
  response: {
    id: string;
  };
}
