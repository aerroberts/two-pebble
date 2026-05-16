import type { PebbleAgentTrace } from '@two-pebble/pebble';

/**
 * Defines the AgentTraceRecordedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentTraceRecordedEvent {
  name: 'agentTraceRecorded';
  payload: PebbleAgentTrace & {
    agentId: string;
    createdAt: number;
    id: string;
    orderId: number;
  };
}
