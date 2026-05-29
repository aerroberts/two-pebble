'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

/**
 * Returns the command that asks the daemon to read both sides and build a
 * reconcile plan. The caller holds the returned plan in component state and
 * toggles entries locally before applying.
 */
export function useDataSyncPlan() {
  return useRealtimeDatastore().dataSync.buildPlan;
}
