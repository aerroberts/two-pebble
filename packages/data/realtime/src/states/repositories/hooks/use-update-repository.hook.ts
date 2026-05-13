'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useUpdateRepository() {
  return useRealtimeDatastore().repositories.update;
}
