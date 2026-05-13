'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateIntegration() {
  return useRealtimeDatastore().integrations.create;
}
