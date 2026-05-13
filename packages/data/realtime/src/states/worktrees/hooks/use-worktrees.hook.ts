'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useWorktrees() {
  const datastore = useRealtimeDatastore();
  const worktrees = useRealtimeStore((state) => state.worktrees);

  useEffect(() => {
    if (worktrees.status === 'idle') {
      void datastore.worktrees.list().catch(() => undefined);
    }
  }, [datastore, worktrees.status]);

  return worktrees;
}
