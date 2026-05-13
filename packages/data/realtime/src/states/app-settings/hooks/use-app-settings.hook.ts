'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAppSettings() {
  const datastore = useRealtimeDatastore();
  const appSettings = useRealtimeStore((state) => state.appSettings);

  useEffect(() => {
    if (appSettings.status === 'idle') {
      void datastore.appSettings.read().catch(() => undefined);
    }
  }, [datastore, appSettings.status]);

  return appSettings;
}
