'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useUpdateIntegration() {
  return useRealtimeDatastore().integrations.update;
}
