import type { CellContent } from '@two-pebble/pebble';

/**
 * Defines the AgentQueuedMessageEnqueueOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentQueuedMessageEnqueueOperation {
  name: 'enqueueAgentMessage';
  request: {
    agentId: string;
    message?: string;
    cells?: CellContent[];
  };
  response: {
    id: string;
  };
}
