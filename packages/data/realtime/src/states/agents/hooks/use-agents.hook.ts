'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgents() {
  const datastore = useRealtimeDatastore();
  const agents = useRealtimeStore((state) => state.agents);

  useEffect(() => {
    if (agents.status === 'idle') {
      void datastore.agent.list().catch(() => undefined);
    }
  }, [agents.status, datastore]);

  return agents;
}
