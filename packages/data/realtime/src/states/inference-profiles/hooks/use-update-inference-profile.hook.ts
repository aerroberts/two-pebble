'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useUpdateInferenceProfile() {
  return useRealtimeDatastore().inferenceProfiles.update;
}
