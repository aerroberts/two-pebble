import type { PebbleJsonValue } from '@two-pebble/pebble';

/**
 * Defines the AgentSignalWireRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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

/**
 * Defines the AgentSignalsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentSignalsListOperation {
  name: 'listAgentSignals';
  request: {
    agentId: string;
  };
  response: {
    items: AgentSignalWireRecord[];
  };
}
