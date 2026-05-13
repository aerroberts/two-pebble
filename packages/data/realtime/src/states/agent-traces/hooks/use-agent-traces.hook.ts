'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { RealtimeDatastore } from '../../../realtime-datastore';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export interface UseAgentTracesInput {
  agentId: string;
  agentIds?: string[];
}

export function useAgentTraces(input: UseAgentTracesInput) {
  const datastore = useRealtimeDatastore();
  const agentTraces = useRealtimeStore((state) => state.agentTraces);
  const agentIdsKey = (input.agentIds ?? [input.agentId]).join(',');

  useEffect(() => {
    const agentIds = agentIdsKey.length === 0 ? [] : agentIdsKey.split(',');
    void listAgentTraces(datastore, agentIds).catch(() => undefined);
  }, [agentIdsKey, datastore]);

  return agentTraces;
}

async function listAgentTraces(datastore: RealtimeDatastore, agentIds: string[]) {
  for (const agentId of agentIds) {
    if (agentId.length > 0) {
      await datastore.agent.traces.list({ agentId });
    }
  }
}
