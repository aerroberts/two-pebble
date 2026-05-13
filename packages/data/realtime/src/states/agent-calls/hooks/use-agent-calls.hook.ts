'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export interface UseAgentCallsInput {
  agentId: string;
}

export function useAgentCalls(input: UseAgentCallsInput) {
  const datastore = useRealtimeDatastore();
  const agentCalls = useRealtimeStore((state) => state.agentCalls);

  useEffect(() => {
    if (agentCalls.status === 'idle') {
      void datastore.agent.calls.list({ agentId: input.agentId }).catch(() => undefined);
    }
  }, [agentCalls.status, input.agentId, datastore]);

  return agentCalls;
}
