import type { AgentQueuedMessageWireRecord } from './agent.queued-messages.list';

/**
 * Defines the AgentQueuedMessageSendNowOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentQueuedMessageSendNowOperation {
  name: 'sendAgentQueuedMessageNow';
  request: {
    id: string;
  };
  response: AgentQueuedMessageWireRecord;
}
