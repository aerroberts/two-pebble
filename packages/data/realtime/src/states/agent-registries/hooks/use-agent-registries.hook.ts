'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

/**
 * Returns the global agent registry. Registries are no longer scoped to a
 * project; use {@link useProjectAgentRegistries} to get the subset a project
 * has enabled for its dropdowns.
 */
export function useAgentRegistries() {
  const datastore = useRealtimeDatastore();
  const agentRegistries = useRealtimeStore((state) => state.agentRegistries);

  useEffect(() => {
    if (agentRegistries.status === 'idle') {
      void datastore.agentRegistries.list().catch(() => undefined);
    }
  }, [agentRegistries.status, datastore]);

  return agentRegistries;
}
