'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useDebugLogs() {
  const datastore = useRealtimeDatastore();
  const debugLogs = useRealtimeStore((state) => state.debugLogs);

  useEffect(() => {
    void datastore.debug.logs.list().catch(() => undefined);
  }, [datastore]);

  return debugLogs;
}
