import type { PebbleAgentTrace } from '@two-pebble/pebble';

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
