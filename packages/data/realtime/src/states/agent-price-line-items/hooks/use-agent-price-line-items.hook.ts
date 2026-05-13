'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export interface UseAgentPriceLineItemsInput {
  agentId: string;
}

export function useAgentPriceLineItems(input: UseAgentPriceLineItemsInput) {
  const datastore = useRealtimeDatastore();
  const lineItems = useRealtimeStore((state) => state.agentPriceLineItems);
  const agents = useRealtimeStore((state) => state.agentPriceLineItemAgents);
  const agentId = input.agentId;

  useEffect(() => {
    if (agentId.length === 0) {
      return;
    }
    const agent = agents.getItem(agentId);
    if (agent === null) {
      void datastore.agent.priceLineItems.list({ agentId }).catch(() => undefined);
    }
  }, [agents, datastore, agentId]);

  return { lineItems, agents };
}
