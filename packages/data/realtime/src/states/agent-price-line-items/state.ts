import { LoadableRegistry } from '../../loadable';
import type { AgentPriceLineItemAgentRecord, AgentPriceLineItemRecord, AgentPriceLineItemsState } from './types';

export function createAgentPriceLineItemsState(): AgentPriceLineItemsState {
  return {
    agentPriceLineItemAgents: new LoadableRegistry<AgentPriceLineItemAgentRecord>(),
    agentPriceLineItems: new LoadableRegistry<AgentPriceLineItemRecord>(),
  };
}

export function agentPriceLineItemKey(lineItem: AgentPriceLineItemRecord) {
  return `${lineItem.agentId}:${lineItem.id}`;
}
