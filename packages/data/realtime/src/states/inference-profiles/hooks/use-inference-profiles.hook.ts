'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useInferenceProfiles() {
  const datastore = useRealtimeDatastore();
  const inferenceProfiles = useRealtimeStore((state) => state.inferenceProfiles);

  useEffect(() => {
    if (inferenceProfiles.status === 'idle') {
      void datastore.inferenceProfiles.list().catch(() => undefined);
    }
  }, [datastore, inferenceProfiles.status]);

  return inferenceProfiles;
}
