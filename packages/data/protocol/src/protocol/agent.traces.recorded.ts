import type { PebbleAgentTrace } from '@two-pebble/pebble';

export interface AgentTraceRecordedEvent {
  name: 'agentTraceRecorded';
  payload: PebbleAgentTrace & {
    agentId: string;
    createdAt: number;
    id: string;
    orderId: number;
  };
}
