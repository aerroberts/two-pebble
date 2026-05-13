export interface AgentLaunchOperation {
  name: 'launchAgent';
  request: {
    /**
     * The user-configured agent registry row to launch. The daemon resolves
     * the workspace from the registry's `workspaceConfig` and decides whether
     * to build a framework agent or a Pebble agent based on `kind`.
     */
    agentRegistryId: string;
    message: string;
  };
  response: {
    id: string;
  };
}
