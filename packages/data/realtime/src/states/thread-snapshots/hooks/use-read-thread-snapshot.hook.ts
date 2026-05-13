'use client';

import { useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useReadThreadSnapshot() {
  const datastore = useRealtimeDatastore();
  return useMemo(() => datastore.threads.snapshots.read, [datastore]);
}
