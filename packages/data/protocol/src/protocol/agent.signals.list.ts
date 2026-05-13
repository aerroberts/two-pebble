import type { PebbleJsonValue } from '@two-pebble/pebble';

export interface AgentSignalWireRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  kind: 'awaited' | 'push';
  name: string;
  receivedAt: number | null;
  resolvedAt: number | null;
  signalId: string;
  status: 'open' | 'received' | 'resolved';
}

export interface AgentSignalsListOperation {
  name: 'listAgentSignals';
  request: {
    agentId: string;
  };
  response: {
    items: AgentSignalWireRecord[];
  };
}
