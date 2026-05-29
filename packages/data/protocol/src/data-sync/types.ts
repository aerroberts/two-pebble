/**
 * Shared data-sync contracts. These types describe the on-disk record format,
 * the reconcile plan the daemon builds, and the entries the UI renders and
 * toggles. They are intentionally free of any `node:` or datastore imports so
 * both the daemon (which reads/writes disk) and the UI (which recomputes the
 * cascade as the user toggles entries) can depend on them.
 */

/** Entity kinds that participate in data sync, matching the design scope table. */
export type SyncEntityType = 'project' | 'repository' | 'agentRegistry' | 'document' | 'automation' | 'board';

/** Whether a plan writes the local instance to disk or pulls disk into the instance. */
export type SyncDirection = 'export' | 'import';

/** Per-record diff outcome. `blocked` is derived from unresolved dependencies. */
export type DiffStatus = 'new' | 'changed' | 'unchanged' | 'blocked';

/** Base diff outcome before the cascade marks a record blocked. */
export type BaseDiffStatus = 'new' | 'changed' | 'unchanged';

/**
 * A single record as serialized to disk. FK fields inside `fields` hold the
 * target's NAME, never a local database id. `contentHash` is computed over the
 * canonical JSON of `fields` after the whitelist + FK rewrite, so the same
 * logical record on two instances produces identical bytes.
 */
export interface DiskRecord {
  version: 1;
  entityType: SyncEntityType;
  name: string;
  projectName?: string;
  fields: Record<string, unknown>;
  contentHash: string;
}

/**
 * One dependency edge of a record, derived from its `fields` plus the static
 * serializer registry. `syncable` is true when the target is itself a synced
 * entity (and can therefore be selected to unblock the dependent); false for
 * ambient references such as inference profiles that only resolve against
 * records already present on the receiving side.
 */
export interface DependencyRef {
  key: string;
  entityType: string;
  name: string;
  syncable: boolean;
}

/** A single reviewable row in the reconcile plan. */
export interface ReconcileEntry {
  key: string;
  entityType: SyncEntityType;
  name: string;
  projectName?: string;
  status: DiffStatus;
  baseStatus: BaseDiffStatus;
  direction: SyncDirection;
  local?: DiskRecord;
  disk?: DiskRecord;
  dependsOn: DependencyRef[];
  blockedBy: string[];
  selected: boolean;
  selectable: boolean;
}

/** The full plan produced by `buildDataSyncPlan` and consumed by `applyDataSyncPlan`. */
export interface ReconcilePlan {
  direction: SyncDirection;
  directory: string;
  entries: ReconcileEntry[];
  /** Disk keys with no local counterpart (export only) — always cleaned up. */
  orphans: string[];
  /** Keys already present on the receiving side, including ambient references. */
  destinationKeys: string[];
  warnings: string[];
}
