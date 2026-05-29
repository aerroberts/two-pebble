import type {
  BaseDiffStatus,
  DependencyRef,
  DiskRecord,
  ReconcileEntry,
  ReconcilePlan,
  SyncDirection,
} from '@two-pebble/protocol';
import { defaultSelected, diskRecordKey, recomputeBlocked } from '@two-pebble/protocol';

/**
 * Pure reconcile step — the testable seam. Given the two serialized snapshots
 * it produces a `ReconcilePlan`: per-record diff status, derived dependencies,
 * default selection, blocked cascade, and (for export) the set of orphan disk
 * files that the true-replacement export will remove. No filesystem, datastore,
 * or id access lives here.
 */
export interface ReconcileInput {
  direction: SyncDirection;
  directory: string;
  scope: { projectNames: string[] };
  local: DiskRecord[];
  disk: DiskRecord[];
  /** Keys for ambient references (e.g. inference profiles) present on the destination. */
  ambientKeys: string[];
  /** Pure dependency derivation, injected for testability. */
  dependenciesOf: (record: DiskRecord) => DependencyRef[];
  warnings: string[];
}

/** Whether a record is in scope for an export. Global entities always are. */
function inScope(record: DiskRecord, projectNames: string[]): boolean {
  if (
    record.entityType === 'repository' ||
    record.entityType === 'agentRegistry' ||
    record.entityType === 'automation'
  ) {
    return true;
  }
  if (record.entityType === 'project') {
    return projectNames.includes(record.name);
  }
  return record.projectName !== undefined && projectNames.includes(record.projectName);
}

function byKey(records: DiskRecord[]): Map<string, DiskRecord> {
  const map = new Map<string, DiskRecord>();
  for (const record of records) {
    map.set(diskRecordKey(record), record);
  }
  return map;
}

export function reconcile(input: ReconcileInput): ReconcilePlan {
  const { direction } = input;

  const sourceRecords =
    direction === 'export' ? input.local.filter((record) => inScope(record, input.scope.projectNames)) : input.disk;
  const destinationRecords = direction === 'export' ? input.disk : input.local;

  const sourceByKey = byKey(sourceRecords);
  const destinationByKey = byKey(destinationRecords);

  const destinationKeys = [...destinationByKey.keys(), ...input.ambientKeys];

  const entries: ReconcileEntry[] = [];
  for (const [key, source] of sourceByKey) {
    const counterpart = destinationByKey.get(key);
    const baseStatus: BaseDiffStatus =
      counterpart === undefined ? 'new' : source.contentHash === counterpart.contentHash ? 'unchanged' : 'changed';

    entries.push({
      key,
      entityType: source.entityType,
      name: source.name,
      projectName: source.projectName,
      status: baseStatus,
      baseStatus,
      direction,
      local: direction === 'export' ? source : counterpart,
      disk: direction === 'export' ? counterpart : source,
      dependsOn: input.dependenciesOf(source),
      blockedBy: [],
      selected: defaultSelected(baseStatus, direction),
      selectable: baseStatus !== 'unchanged',
    });
  }

  // Export is a true replacement: disk records with no local counterpart are
  // orphans and will be removed. Import never deletes.
  const orphans = direction === 'export' ? [...destinationByKey.keys()].filter((key) => !sourceByKey.has(key)) : [];

  recomputeBlocked(entries, destinationKeys);

  return {
    direction,
    directory: input.directory,
    entries,
    orphans,
    destinationKeys,
    warnings: input.warnings,
  };
}
