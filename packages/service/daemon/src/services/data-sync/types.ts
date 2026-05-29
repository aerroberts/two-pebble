import type { DiskRecord } from '@two-pebble/protocol';

/** Outcome of applying a reconcile plan. */
export interface ApplyResult {
  applied: number;
  skipped: number;
  orphansRemoved: number;
  warnings: string[];
}

/** Result of reading every record under a sync directory. */
export interface DiskReadResult {
  records: DiskRecord[];
  /** Key → absolute file path, for orphan removal. */
  pathByKey: Map<string, string>;
  warnings: string[];
}
