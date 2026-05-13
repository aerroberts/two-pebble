'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useUpdateAppSettings() {
  return useRealtimeDatastore().appSettings.update;
}
