'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgents(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const agents = useRealtimeStore((state) => state.agents);
  const projectId = input?.projectId;

  useEffect(() => {
    if (projectId !== undefined) {
      void datastore.agent.list({ projectId }).catch(() => undefined);
    } else if (agents.status === 'idle') {
      void datastore.agent.list().catch(() => undefined);
    }
  }, [agents.status, datastore, projectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return agents;
    }
    return agents
      .withItems(agents.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(agents.status);
  }, [agents, projectId]);
}
