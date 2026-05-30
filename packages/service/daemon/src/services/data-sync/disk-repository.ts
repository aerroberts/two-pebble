import fs from 'node:fs';
import path from 'node:path';
import type { DiskRecord, SyncEntityType } from '@two-pebble/protocol';
import { diskRecordKey } from '@two-pebble/protocol';
import type { DiskReadResult } from './types';

const PROJECTS_DIR = 'projects';
const REPOSITORIES_DIR = 'repositories';

const ENTITY_SUBDIR: Record<Exclude<SyncEntityType, 'project' | 'repository'>, string> = {
  agentRegistry: 'agent-registry',
  document: 'documents',
  automation: 'automations',
  board: 'boards',
};

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'unnamed';
}

/**
 * Owns the on-disk representation: folder layout, canonical-JSON read/write,
 * atomic per-record writes, and orphan cleanup. It never sees database ids —
 * records arrive already serialized with FK names. It is the only data-sync
 * module besides the handlers that touches the filesystem.
 */
export class DiskRepository {
  /** Resolves the absolute file path for a record from its identity. */
  public filePathFor(directory: string, record: DiskRecord): string {
    if (record.entityType === 'repository') {
      return path.join(directory, REPOSITORIES_DIR, `${slugify(record.name)}.json`);
    }
    if (record.entityType === 'project') {
      return path.join(directory, PROJECTS_DIR, slugify(record.name), 'project.json');
    }
    // Global (non-project) entities live in a top-level folder by entity kind.
    if (record.projectName === undefined) {
      return path.join(directory, ENTITY_SUBDIR[record.entityType], `${slugify(record.name)}.json`);
    }
    const projectDir = path.join(directory, PROJECTS_DIR, slugify(record.projectName));
    return path.join(projectDir, ENTITY_SUBDIR[record.entityType], `${slugify(record.name)}.json`);
  }

  /** Writes one record atomically (temp file + rename). Creates parent dirs. */
  public write(directory: string, record: DiskRecord): void {
    const filePath = this.filePathFor(directory, record);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const contents = `${JSON.stringify(record, null, 2)}\n`;
    const tempPath = `${filePath}.tmp-${process.pid}`;
    fs.writeFileSync(tempPath, contents, 'utf8');
    fs.renameSync(tempPath, filePath);
  }

  /** Ensures the sync directory exists (used before an export). */
  public ensureDirectory(directory: string): void {
    fs.mkdirSync(directory, { recursive: true });
  }

  /** Reads and validates every record under the directory. Missing dir → empty. */
  public readAll(directory: string): DiskReadResult {
    const records: DiskRecord[] = [];
    const pathByKey = new Map<string, string>();
    const warnings: string[] = [];

    if (!fs.existsSync(directory)) {
      return { records, pathByKey, warnings };
    }

    for (const filePath of this.walkJsonFiles(directory)) {
      const parsed = this.readRecord(filePath, warnings);
      if (parsed === null) {
        continue;
      }
      const key = diskRecordKey(parsed);
      records.push(parsed);
      pathByKey.set(key, filePath);
    }

    return { records, pathByKey, warnings };
  }

  /** Removes orphan files by key. Per-file failures are collected, not thrown. */
  public removeOrphans(directory: string, orphanKeys: string[]): { removed: number; warnings: string[] } {
    if (orphanKeys.length === 0) {
      return { removed: 0, warnings: [] };
    }
    const { pathByKey } = this.readAll(directory);
    const warnings: string[] = [];
    let removed = 0;
    for (const key of orphanKeys) {
      const filePath = pathByKey.get(key);
      if (filePath === undefined) {
        continue;
      }
      try {
        fs.rmSync(filePath, { force: true });
        removed += 1;
      } catch (error) {
        warnings.push(`Could not remove ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return { removed, warnings };
  }

  private *walkJsonFiles(directory: string): Generator<string> {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        yield* this.walkJsonFiles(full);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        yield full;
      }
    }
  }

  private readRecord(filePath: string, warnings: string[]): DiskRecord | null {
    let raw: string;
    try {
      raw = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      warnings.push(`Could not read ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      warnings.push(`Skipped malformed JSON file ${filePath}.`);
      return null;
    }

    if (!this.isDiskRecord(parsed)) {
      warnings.push(`Skipped ${filePath}: not a recognized sync record.`);
      return null;
    }
    if (parsed.version !== 1) {
      warnings.push(`Skipped ${filePath}: unsupported sync version ${String(parsed.version)}.`);
      return null;
    }
    return parsed;
  }

  private isDiskRecord(value: unknown): value is DiskRecord {
    if (value === null || typeof value !== 'object') {
      return false;
    }
    const record = value as Record<string, unknown>;
    return (
      typeof record.entityType === 'string' &&
      typeof record.name === 'string' &&
      typeof record.contentHash === 'string' &&
      typeof record.fields === 'object' &&
      record.fields !== null
    );
  }
}
