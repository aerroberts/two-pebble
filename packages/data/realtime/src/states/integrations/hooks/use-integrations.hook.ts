'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from './use-realtime-store.hook';

export function useIntegrations() {
  const datastore = useRealtimeDatastore();
  const integrations = useRealtimeStore((state) => state.integrations);

  useEffect(() => {
    if (integrations.status === 'idle') {
      void datastore.integrations.list().catch(() => undefined);
    }
  }, [datastore, integrations.status]);

  return integrations;
}
