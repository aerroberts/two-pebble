import type { AgentQueuedMessageWireRecord } from './agent.queued-messages.list';

/**
 * Defines the AgentQueuedMessageChangedEvent protocol contract for daemon bridge messages.
 */
export interface AgentQueuedMessageChangedEvent {
  name: 'agentQueuedMessageChanged';
  payload: AgentQueuedMessageWireRecord;
}
