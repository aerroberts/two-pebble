'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgents(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const agents = useRealtimeStore((state) => state.agents);
  const projectId = input?.projectId;
  const fetchedProjectId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (projectId !== undefined) {
      // Fetch once per project (or when nothing has loaded yet); otherwise the status patch
      // from a successful fetch retriggers this effect via the deps array and loops forever.
      if (fetchedProjectId.current !== projectId || agents.status === 'idle') {
        fetchedProjectId.current = projectId;
        void datastore.agent.list({ projectId }).catch(() => undefined);
      }
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
