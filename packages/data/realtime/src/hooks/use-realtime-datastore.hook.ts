'use client';

import { useContext } from 'react';
import { RealtimeContext } from '../realtime-context';
import type { RealtimeDatastore } from '../realtime-datastore';

export function useRealtimeDatastore(): RealtimeDatastore {
  const datastore = useContext(RealtimeContext);
  if (datastore === null) {
    throw new Error('Realtime hooks must be used inside <RealtimeDaemonConnection>.');
  }

  return datastore;
}
