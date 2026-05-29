'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

/**
 * Returns the command that applies a reviewed reconcile plan — writing to disk
 * (export) or upserting into the datastore by name (import).
 */
export function useApplyDataSyncPlan() {
  return useRealtimeDatastore().dataSync.apply;
}
