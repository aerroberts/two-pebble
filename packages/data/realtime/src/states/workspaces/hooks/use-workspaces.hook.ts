'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useWorkspaces() {
  const datastore = useRealtimeDatastore();
  const workspaces = useRealtimeStore((state) => state.workspaces);

  useEffect(() => {
    if (workspaces.status === 'idle') {
      void datastore.workspaces.list().catch(() => undefined);
    }
  }, [datastore, workspaces.status]);

  return workspaces;
}
