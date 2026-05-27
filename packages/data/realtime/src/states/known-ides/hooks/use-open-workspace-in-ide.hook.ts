'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useOpenWorkspaceInIde() {
  return useRealtimeDatastore().knownIdes.open;
}
