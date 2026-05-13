'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgentRegistries() {
  const datastore = useRealtimeDatastore();
  const agentRegistries = useRealtimeStore((state) => state.agentRegistries);

  useEffect(() => {
    if (agentRegistries.status === 'idle') {
      void datastore.agentRegistries.list().catch(() => undefined);
    }
  }, [datastore, agentRegistries.status]);

  return agentRegistries;
}
