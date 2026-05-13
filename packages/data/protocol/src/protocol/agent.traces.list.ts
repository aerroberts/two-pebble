import type { PebbleAgentTrace } from '@two-pebble/pebble';

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
