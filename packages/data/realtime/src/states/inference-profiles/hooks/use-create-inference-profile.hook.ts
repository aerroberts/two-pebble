'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateInferenceProfile() {
  return useRealtimeDatastore().inferenceProfiles.create;
}
