'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useOpenDebugLog() {
  return useRealtimeDatastore().debug.logs.open;
}
