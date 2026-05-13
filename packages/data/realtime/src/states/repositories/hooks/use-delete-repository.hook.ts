'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteRepository() {
  return useRealtimeDatastore().repositories.delete;
}
