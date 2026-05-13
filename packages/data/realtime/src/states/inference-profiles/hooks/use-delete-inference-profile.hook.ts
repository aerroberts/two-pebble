'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteInferenceProfile() {
  return useRealtimeDatastore().inferenceProfiles.delete;
}
