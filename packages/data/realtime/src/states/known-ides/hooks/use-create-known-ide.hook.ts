'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateKnownIde() {
  return useRealtimeDatastore().knownIdes.create;
}
