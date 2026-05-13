'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateAgentRegistry() {
  return useRealtimeDatastore().agentRegistries.create;
}
