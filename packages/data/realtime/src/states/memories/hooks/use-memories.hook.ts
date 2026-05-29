'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useMemories(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const memories = useRealtimeStore((state) => state.memories);
  const projectId = input?.projectId;
  // The shared store may hold memories from a previously-viewed project. Track which
  // projectId we've initiated a fetch for so consumers don't show an empty state from
  // stale data before our fetch lands.
  const [fetchedProjectId, setFetchedProjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (projectId !== undefined) {
      if (fetchedProjectId !== projectId || memories.status === 'idle') {
        setFetchedProjectId(projectId);
        void datastore.memories.list({ limit: 200, offset: 0, projectId }).catch(() => undefined);
      }
    } else if (memories.status === 'idle') {
      void datastore.memories.list({ limit: 200, offset: 0 }).catch(() => undefined);
    }
  }, [datastore, memories.status, projectId, fetchedProjectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return memories;
    }
    const effectiveStatus = fetchedProjectId === projectId ? memories.status : 'loading';
    return memories
      .withItems(memories.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(effectiveStatus);
  }, [memories, projectId, fetchedProjectId]);
}
