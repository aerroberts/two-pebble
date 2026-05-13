'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useTranscribeAudio() {
  return useRealtimeDatastore().transcribeAudio;
}
