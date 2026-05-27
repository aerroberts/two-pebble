'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDetectIdes() {
  return useRealtimeDatastore().knownIdes.detect;
}
