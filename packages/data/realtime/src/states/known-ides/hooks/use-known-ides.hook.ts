'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useKnownIdes() {
  const datastore = useRealtimeDatastore();
  const knownIdes = useRealtimeStore((state) => state.knownIdes);

  useEffect(() => {
    if (knownIdes.status === 'idle') {
      void datastore.knownIdes.list().catch(() => undefined);
    }
  }, [datastore, knownIdes.status]);

  return knownIdes;
}
