'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteKnownIde() {
  return useRealtimeDatastore().knownIdes.delete;
}
