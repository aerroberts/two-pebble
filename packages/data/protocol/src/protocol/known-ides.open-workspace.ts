export interface OpenWorkspaceInIdeOperation {
  name: 'openWorkspaceInIde';
  request: {
    knownIdeId: string;
    workspacePath: string;
  };
  response: object;
}
