'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

interface UseTaskEventsInput {
  taskId: string;
}

/**
 * Loads + selects the recorded events for a single task.
 * Triggers the list operation on first mount and filters the global registry
 * down to entries that match the task id.
 */
export function useTaskEvents(input: UseTaskEventsInput) {
  const datastore = useRealtimeDatastore();
  const allEvents = useRealtimeStore((state) => state.taskEvents);

  useEffect(() => {
    if (input.taskId.length === 0) return;
    void datastore.taskEvents.list({ taskId: input.taskId }).catch(() => undefined);
  }, [datastore, input.taskId]);

  const events = useMemo(
    () =>
      allEvents
        .values()
        .filter((event) => event.taskId === input.taskId)
        .sort((left, right) => left.createdAt - right.createdAt),
    [allEvents, input.taskId],
  );

  return { events };
}
