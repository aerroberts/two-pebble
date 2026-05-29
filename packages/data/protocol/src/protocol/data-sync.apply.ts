import type { ReconcilePlan } from '../data-sync/types';

/**
 * Applies a reviewed reconcile plan: writes selected records to disk (export)
 * or upserts them into the datastore by name (import), in fixed dependency
 * order. Export additionally removes orphan files so disk is a true replica.
 */
export interface DataSyncApplyOperation {
  name: 'applyDataSyncPlan';
  request: {
    plan: ReconcilePlan;
  };
  response: {
    applied: number;
    skipped: number;
    orphansRemoved: number;
    warnings: string[];
  };
}
