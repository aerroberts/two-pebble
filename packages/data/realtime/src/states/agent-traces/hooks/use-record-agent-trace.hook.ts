'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useRecordAgentTrace() {
  return useRealtimeDatastore().agent.traces.record;
}
