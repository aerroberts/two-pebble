'use client';

import { useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useReadAgentCall() {
  const datastore = useRealtimeDatastore();
  return useMemo(() => datastore.agent.calls.read, [datastore]);
}
