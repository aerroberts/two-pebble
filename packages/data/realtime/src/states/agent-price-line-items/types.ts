import type { LoadableRegistry } from '../../loadable';

export interface AgentPriceLineItemsState {
  agentPriceLineItems: LoadableRegistry<AgentPriceLineItemRecord>;
  agentPriceLineItemAgents: LoadableRegistry<AgentPriceLineItemAgentRecord>;
}

export interface AgentPriceLineItemRecord {
  id: string;
  agentId: string;
  modelCallId: string | null;
  inferenceProfileId?: string;
  integrationId?: string;
  provider: string;
  modelId: string;
  modelVariantId?: string;
  charge: string;
  price: number;
  quantity: number;
  timestamp?: number;
  total: number;
}

export interface AgentPriceLineItemAgentRecord {
  id: string;
}

export interface ListAgentPriceLineItemsInput {
  agentId: string;
}

export interface RecordAgentPriceLineItemInput {
  agentId: string;
  modelCallId: string | null;
  inferenceProfileId?: string | null;
  integrationId?: string | null;
  provider: string;
  modelId: string;
  modelVariantId?: string | null;
  charge: string;
  price: number;
  quantity: number;
  timestamp?: number;
  total: number;
}
