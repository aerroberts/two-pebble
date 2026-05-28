'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgentRegistries(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const agentRegistries = useRealtimeStore((state) => state.agentRegistries);
  const projectId = input?.projectId;
  const fetchedProjectId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (projectId !== undefined) {
      // Fetch once per project (or when nothing has loaded yet); otherwise the status patch
      // from a successful fetch retriggers this effect via the deps array and loops forever.
      if (fetchedProjectId.current !== projectId || agentRegistries.status === 'idle') {
        fetchedProjectId.current = projectId;
        void datastore.agentRegistries.list({ projectId }).catch(() => undefined);
      }
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
