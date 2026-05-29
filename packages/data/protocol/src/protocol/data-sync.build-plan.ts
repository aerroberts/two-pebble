import type { ReconcilePlan, SyncDirection } from '../data-sync/types';

/**
 * Reads both the local instance and the chosen sync directory, then returns a
 * reconcile plan the UI renders for review. The daemon holds no state between
 * this and `applyDataSyncPlan` — the plan travels back with the apply request.
 */
export interface DataSyncBuildPlanOperation {
  name: 'buildDataSyncPlan';
  request: {
    direction: SyncDirection;
    directory: string;
    /** Project names in scope. Empty means every project. Global entities always included. */
    projectNames: string[];
  };
  response: ReconcilePlan;
}
