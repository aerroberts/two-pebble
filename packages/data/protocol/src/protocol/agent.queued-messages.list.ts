import type { DataCells } from '@two-pebble/pebble';

export interface AgentQueuedMessageWireRecord {
  id: string;
  agentId: string;
  cells: DataCells;
  status: 'queued' | 'sent' | 'failed';
  lastError: string | null;
  sentAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Defines the AgentQueuedMessagesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentQueuedMessagesListOperation {
  name: 'listAgentQueuedMessages';
  request: {
    agentId: string;
  };
  response: {
    items: AgentQueuedMessageWireRecord[];
  };
}
