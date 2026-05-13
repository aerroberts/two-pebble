'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useReadDebugLog() {
  return useRealtimeDatastore().debug.logs.read;
}
