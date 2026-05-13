/**
 * Workspace config that pins the agent to a fixed absolute filesystem path.
 * Replaces the legacy 'fixed' kind. The path is stored verbatim and used
 * as the agent's working directory on launch.
 */
export interface WorkspaceConfig_Absolute {
  kind: 'absolute';
  path: string;
}
