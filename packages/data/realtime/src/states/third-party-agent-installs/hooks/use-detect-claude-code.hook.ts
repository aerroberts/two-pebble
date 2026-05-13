'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDetectClaudeCode() {
  return useRealtimeDatastore().thirdPartyAgentInstalls.detectClaudeCode;
}
