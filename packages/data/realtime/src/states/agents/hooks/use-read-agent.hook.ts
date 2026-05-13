'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useReadAgent() {
  return useRealtimeDatastore().agent.read;
}
