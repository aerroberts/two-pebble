'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgentRegistries(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const agentRegistries = useRealtimeStore((state) => state.agentRegistries);
  const projectId = input?.projectId;

  useEffect(() => {
    if (projectId !== undefined) {
      void datastore.agentRegistries.list({ projectId }).catch(() => undefined);
    } else if (agentRegistries.status === 'idle') {
      void datastore.agentRegistries.list().catch(() => undefined);
    }
  }, [agentRegistries.status, datastore, projectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return agentRegistries;
    }
    return agentRegistries
      .withItems(agentRegistries.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(agentRegistries.status);
  }, [agentRegistries, projectId]);
}
