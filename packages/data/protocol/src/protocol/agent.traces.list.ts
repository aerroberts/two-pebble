import type { PebbleAgentTrace } from '@two-pebble/pebble';

/**
 * Defines the AgentTracesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentTracesListOperation {
  name: 'listAgentTraces';
  request: {
    agentId: string;
    limit: number;
    offset: number;
  };
  response: {
    items: (PebbleAgentTrace & {
      agentId: string;
      createdAt: number;
      id: string;
      orderId: number;
    })[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
