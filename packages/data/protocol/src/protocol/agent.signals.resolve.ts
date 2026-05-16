import type { PebbleJsonValue } from '@two-pebble/pebble';

/**
 * Defines the AgentSignalsResolveOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentSignalsResolveOperation {
  name: 'resolveAgentSignal';
  request: {
    agentId: string;
    capabilityId: string;
    data: PebbleJsonValue;
    signalId: string;
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
