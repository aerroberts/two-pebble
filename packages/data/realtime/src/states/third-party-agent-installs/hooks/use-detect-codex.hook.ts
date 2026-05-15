'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDetectCodex() {
  return useRealtimeDatastore().thirdPartyAgentInstalls.detectCodex;
}
