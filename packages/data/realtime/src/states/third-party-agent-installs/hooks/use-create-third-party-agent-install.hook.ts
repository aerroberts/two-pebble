'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateThirdPartyAgentInstall() {
  return useRealtimeDatastore().thirdPartyAgentInstalls.create;
}
