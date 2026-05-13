'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useRepositories() {
  const datastore = useRealtimeDatastore();
  const repositories = useRealtimeStore((state) => state.repositories);

  useEffect(() => {
    if (repositories.status === 'idle') {
      void datastore.repositories.list().catch(() => undefined);
    }
  }, [datastore, repositories.status]);

  return repositories;
}
