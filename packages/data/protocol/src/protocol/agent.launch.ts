import type { CellContent } from '@two-pebble/pebble';

export interface AgentLaunchOperation {
  name: 'launchAgent';
  request: {
    /**
     * The user-configured agent registry row to launch. The daemon resolves
     * the workspace from the registry's `workspaceConfig` and decides whether
     * to build a framework agent or a Pebble agent based on `kind`.
     */
    agentRegistryId: string;
    /** Markdown/text fallback for legacy logging and voice workflows. */
    message: string;
    /** Structured cells produced by the rich composer (preferred when present). */
    cells?: CellContent[];
  };
  response: {
    id: string;
  };
}
