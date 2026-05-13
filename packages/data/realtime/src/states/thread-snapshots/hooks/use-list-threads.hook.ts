'use client';

import { useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useListThreads() {
  const datastore = useRealtimeDatastore();
  return useMemo(() => datastore.threads.list, [datastore]);
}
