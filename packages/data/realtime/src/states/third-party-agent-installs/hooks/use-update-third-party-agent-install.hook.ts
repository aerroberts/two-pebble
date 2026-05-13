'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useUpdateThirdPartyAgentInstall() {
  return useRealtimeDatastore().thirdPartyAgentInstalls.update;
}
