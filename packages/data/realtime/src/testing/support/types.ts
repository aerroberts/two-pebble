import type { PebbleAgentUserMessageTrace } from '@two-pebble/pebble';

export interface AgentCreateTestInput {
  description: string;
  name: string;
  projectId: string;
}

export interface ModelCallRecordTestInput {
  agentId: string;
  completedAt: number;
  data: object;
  errorMessage: string;
  id: string;
  modelId: string;
  provider: string;
  startedAt: number;
  status: 'completed';
  threadCellPointer: string;
}

export interface PriceLineItemRecordTestInput {
  agentId: string;
  modelCallId: string;
  inferenceProfileId: string | null;
  integrationId: string | null;
  provider: string;
  modelId: string;
  modelVariantId: string | null;
  charge: string;
  price: number;
  quantity: number;
  timestamp: number;
  total: number;
}

export type TraceRecordTestInput = PebbleAgentUserMessageTrace & {
  agentId: string;
  id: string;
  orderId: number;
};

export type MaybeAgentId = string;
