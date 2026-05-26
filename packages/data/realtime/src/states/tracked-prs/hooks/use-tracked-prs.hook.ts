'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';
import type { TrackedPrRecord } from '../types';

export function useTrackedPrsForTask(input: { taskId: string }) {
  const datastore = useRealtimeDatastore();
  const all = useRealtimeStore((state) => state.trackedPrs);

  useEffect(() => {
    if (input.taskId.length === 0) {
      return;
    }
    void datastore.trackedPrs.list({ taskId: input.taskId }).catch(() => undefined);
  }, [datastore, input.taskId]);

  const prs = useMemo(() => all.values().filter((pr) => pr.taskId === input.taskId), [all, input.taskId]);

  return { prs };
}

export function useMyOpenPrs(input: { agentId?: string } = {}) {
  const datastore = useRealtimeDatastore();
  const all = useRealtimeStore((state) => state.trackedPrs);

  useEffect(() => {
    void datastore.trackedPrs
      .list({ agentId: input.agentId, states: ['mergeable', 'unmergeable'] })
      .catch(() => undefined);
  }, [datastore, input.agentId]);

  const prs: TrackedPrRecord[] = useMemo(
    () =>
      all.values().filter((pr) => (input.agentId === undefined || pr.agentId === input.agentId) && isOpen(pr.state)),
    [all, input.agentId],
  );

  return { prs };
}

function isOpen(state: TrackedPrRecord['state']): boolean {
  return state === 'mergeable' || state === 'unmergeable';
}
