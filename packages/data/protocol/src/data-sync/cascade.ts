import type { BaseDiffStatus, DiskRecord, ReconcileEntry, ReconcilePlan, SyncDirection, SyncEntityType } from './types';

/**
 * Pure helpers shared by the daemon reconciler (initial plan) and the UI
 * (toggle-driven recompute). Keeping the cascade in one place guarantees the
 * server's default selection and the client's live recompute never diverge.
 */

/** Builds the canonical reconcile key for a record: `${type}:${project}:${name}`. */
export function reconcileKey(entityType: SyncEntityType, projectName: string | undefined, name: string): string {
  return `${entityType}:${projectName ?? '*'}:${name}`;
}

/** Builds the reconcile key directly from a disk record. */
export function diskRecordKey(record: DiskRecord): string {
  return reconcileKey(record.entityType, record.projectName, record.name);
}

/** Default checkbox state for a freshly built entry, per the design's selection matrix. */
export function defaultSelected(baseStatus: BaseDiffStatus, direction: SyncDirection): boolean {
  if (baseStatus === 'new') {
    return true;
  }
  if (baseStatus === 'changed') {
    // Export overwrites disk freely; import would clobber local edits, so it is opt-in.
    return direction === 'export';
  }
  return false;
}

/**
 * Recomputes `status`, `blockedBy`, and selection for every entry given the
 * current selection state. A record is blocked when any dependency is neither
 * present on the receiving side nor selected to be applied this run. Blocking
 * cascades: deselecting a dependency re-blocks everything that needs it. Runs
 * to a fixpoint so multi-level chains settle. Mutates and returns `entries`.
 */
export function recomputeBlocked(entries: ReconcileEntry[], destinationKeys: Iterable<string>): ReconcileEntry[] {
  const destination = new Set(destinationKeys);

  for (const entry of entries) {
    entry.status = entry.baseStatus;
    entry.blockedBy = [];
  }

  let changed = true;
  while (changed) {
    changed = false;

    const satisfied = new Set(destination);
    for (const entry of entries) {
      if (entry.selected && (entry.status === 'new' || entry.status === 'changed')) {
        satisfied.add(entry.key);
      }
    }

    for (const entry of entries) {
      // Unchanged records need no apply, so dependencies never block them.
      if (entry.baseStatus === 'unchanged') {
        continue;
      }
      const unmet = entry.dependsOn.filter((dependency) => !satisfied.has(dependency.key));
      const nextStatus = unmet.length > 0 ? 'blocked' : entry.baseStatus;
      const nextBlockedBy = unmet.map((dependency) => dependency.name);

      if (entry.status !== nextStatus) {
        entry.status = nextStatus;
        changed = true;
      }
      entry.blockedBy = nextBlockedBy;

      if (nextStatus === 'blocked' && entry.selected) {
        entry.selected = false;
        changed = true;
      }
    }
  }

  return entries;
}

/**
 * Returns a new plan with the given entry's selection set, with the cascade
 * recomputed. No-op when the entry is missing or not selectable. The UI calls
 * this on every checkbox toggle; the daemon stays stateless between build and
 * apply.
 */
export function toggleSelection(plan: ReconcilePlan, key: string, selected: boolean): ReconcilePlan {
  const entries = plan.entries.map((entry) => ({ ...entry, dependsOn: [...entry.dependsOn] }));
  const target = entries.find((entry) => entry.key === key);
  if (target === undefined || !target.selectable) {
    return plan;
  }
  target.selected = selected;
  recomputeBlocked(entries, plan.destinationKeys);
  return { ...plan, entries };
}

/** Entries that should actually be applied: selected, actionable, not blocked. */
export function actionableEntries(plan: ReconcilePlan): ReconcileEntry[] {
  return plan.entries.filter((entry) => entry.selected && (entry.status === 'new' || entry.status === 'changed'));
}
