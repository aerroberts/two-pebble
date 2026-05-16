import type { CellContent } from '@two-pebble/pebble';

/**
 * Defines the AgentLaunchOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
    /**
     * Document id that originated this launch. Populated when the launch
     * comes from `DocumentEditorPage`. The daemon uses it to auto-attach
     * the `progressive-task-list` capability with `{ documentId }` so the
     * agent can mark todos in that document complete.
     */
    sourceDocumentId?: string;
  };
  response: {
    id: string;
  };
}
