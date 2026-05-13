'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useTaskBoards() {
  const datastore = useRealtimeDatastore();
  const taskBoards = useRealtimeStore((state) => state.taskBoards);

  useEffect(() => {
    if (taskBoards.status === 'idle') {
      void datastore.taskBoards.list().catch(() => undefined);
    }
  }, [datastore, taskBoards.status]);

  return taskBoards;
}
