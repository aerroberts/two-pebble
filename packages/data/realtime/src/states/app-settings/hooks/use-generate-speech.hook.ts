'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useGenerateSpeech() {
  return useRealtimeDatastore().generateSpeech;
}
