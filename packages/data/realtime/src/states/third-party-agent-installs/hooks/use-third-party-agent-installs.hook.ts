'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useThirdPartyAgentInstalls() {
  const datastore = useRealtimeDatastore();
  const installs = useRealtimeStore((state) => state.thirdPartyAgentInstalls);

  useEffect(() => {
    if (installs.status === 'idle') {
      void datastore.thirdPartyAgentInstalls.list().catch(() => undefined);
    }
  }, [datastore, installs.status]);

  return installs;
}
