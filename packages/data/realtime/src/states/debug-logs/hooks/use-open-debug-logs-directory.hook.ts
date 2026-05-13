'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useOpenDebugLogsDirectory() {
  return useRealtimeDatastore().debug.logs.openDirectory;
}
