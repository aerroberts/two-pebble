'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteThirdPartyAgentInstall() {
  return useRealtimeDatastore().thirdPartyAgentInstalls.delete;
}
