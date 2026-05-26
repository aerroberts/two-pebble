import type { CellContent } from '@two-pebble/pebble';

export type AgentLaunchWorkspaceOverride =
  | { kind: 'absolute'; path: string }
  | { kind: 'inherit'; workspaceId: string }
  | { kind: 'none' }
  | { kind: 'worktree'; parentWorkspaceId?: string; repositoryId?: string };

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
    /**
     * Optional launch-time workspace override. Used by orchestration paths
     * such as sub-agent spawning to inherit an existing workspace or force
     * a fresh worktree instead of blindly using the registry default.
     */
    workspaceOverride?: AgentLaunchWorkspaceOverride;
  };
  response: {
    id: string;
  };
}
