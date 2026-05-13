'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateRepository() {
  return useRealtimeDatastore().repositories.create;
}
