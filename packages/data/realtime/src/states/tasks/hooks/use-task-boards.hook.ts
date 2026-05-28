'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useTaskBoards(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const taskBoards = useRealtimeStore((state) => state.taskBoards);
  const projectId = input?.projectId;
  const fetchedProjectId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (projectId !== undefined) {
      // Fetch once per project (or when nothing has loaded yet); otherwise the status patch
      // from a successful fetch retriggers this effect via the deps array and loops forever.
      if (fetchedProjectId.current !== projectId || taskBoards.status === 'idle') {
        fetchedProjectId.current = projectId;
        void datastore.taskBoards.list({ projectId }).catch(() => undefined);
      }
    } else if (taskBoards.status === 'idle') {
      void datastore.taskBoards.list().catch(() => undefined);
    }
  }, [datastore, projectId, taskBoards.status]);

  return useMemo(() => {
    if (projectId === undefined) {
      return taskBoards;
    }
    return taskBoards
      .withItems(taskBoards.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(taskBoards.status);
  }, [projectId, taskBoards]);
}
