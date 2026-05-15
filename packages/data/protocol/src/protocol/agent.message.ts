import type { CellContent } from '@two-pebble/pebble';

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
  };
  response: {
    id: string;
  };
}
