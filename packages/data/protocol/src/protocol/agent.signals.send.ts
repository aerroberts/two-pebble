import type { PebbleJsonValue } from '@two-pebble/pebble';

export interface AgentSignalsSendOperation {
  name: 'sendAgentSignal';
  request: {
    agentId: string;
    capabilityId: string;
    data: PebbleJsonValue;
    description: string;
    name: string;
    signalId?: string;
  };
  response: {
    signal: {
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
    };
  };
}
