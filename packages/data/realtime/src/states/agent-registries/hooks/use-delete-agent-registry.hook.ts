'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteAgentRegistry() {
  return useRealtimeDatastore().agentRegistries.delete;
}
