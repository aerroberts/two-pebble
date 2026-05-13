'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useRecordAgentCall() {
  return useRealtimeDatastore().agent.calls.record;
}
