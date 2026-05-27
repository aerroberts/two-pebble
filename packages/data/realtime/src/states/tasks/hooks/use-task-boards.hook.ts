'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useTaskBoards(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const taskBoards = useRealtimeStore((state) => state.taskBoards);
  const projectId = input?.projectId;

  useEffect(() => {
    if (projectId !== undefined) {
      void datastore.taskBoards.list({ projectId }).catch(() => undefined);
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
