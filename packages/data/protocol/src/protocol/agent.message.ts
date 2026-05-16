import type { CellContent } from '@two-pebble/pebble';

/**
 * Defines the AgentMessageOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentMessageOperation {
  name: 'sendAgentMessage';
  request: {
    /** ID of the running agent that should receive the follow-up message. */
    agentId: string;
    /**
     * Plain-text/markdown fallback. The daemon prefers `cells` when present,
     * but always retains this for legacy logging and voice workflows.
     */
    message: string;
    /**
     * Structured cells produced by the rich composer. When present, the
     * daemon routes these directly to the agent and ignores `message` for
     * delivery (but still keeps `message` available for downstream
     * markdown-based consumers).
     */
    cells?: CellContent[];
    /**
     * Document id that originated this message. Populated when the call
     * comes from `DocumentEditorPage`. The daemon uses it to detect
     * mid-life rebind attempts against an agent that's already bound to a
     * different document and to suppress the `<open-tasks>` block when
     * the agent's `progressive-task-list` capability is not bound to
     * this document.
     */
    sourceDocumentId?: string;
  };
  response: {
    id: string;
  };
}
