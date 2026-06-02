'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useTrackedPrsForTask(taskId: string) {
  const datastore = useRealtimeDatastore();
  const all = useRealtimeStore((state) => state.trackedPrs);

  useEffect(() => {
    if (taskId.length === 0) {
      return;
    }
    void datastore.trackedPrs.list({ taskId }).catch(() => undefined);
  }, [datastore, taskId]);

  return useMemo(() => all.values().filter((row) => row.taskId === taskId), [all, taskId]);
}

export function useTrackedPrsForTasks(taskIds: string[]) {
  const datastore = useRealtimeDatastore();
  const all = useRealtimeStore((state) => state.trackedPrs);
  const taskIdKey = taskIds.join(':');

  useEffect(() => {
    for (const taskId of taskIdKey.split(':')) {
      if (taskId.length > 0) {
        void datastore.trackedPrs.list({ taskId }).catch(() => undefined);
      }
    }
  }, [datastore, taskIdKey]);

  return useMemo(() => {
    const ids = new Set(taskIdKey.split(':'));
    return all.values().filter((row) => ids.has(row.taskId));
  }, [all, taskIdKey]);
}
