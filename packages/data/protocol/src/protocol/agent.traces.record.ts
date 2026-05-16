import type { PebbleAgentTrace } from '@two-pebble/pebble';

/**
 * Defines the AgentTracesRecordOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentTracesRecordOperation {
  name: 'recordAgentTrace';
  request: PebbleAgentTrace & {
    agentId: string;
    id: string;
    orderId: number;
  };
  response: {
    id: string;
  };
}
