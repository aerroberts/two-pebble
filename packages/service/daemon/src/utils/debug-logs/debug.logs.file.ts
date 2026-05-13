import fs from 'node:fs';
import path from 'node:path';

import type { DebugLogFileRecord } from './types';

export function listDebugLogFiles(logsDirectoryPath: string): DebugLogFileRecord[] {
  if (!fs.existsSync(logsDirectoryPath)) {
    return [];
  }

  return fs
    .readdirSync(logsDirectoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.log'))
    .map((entry) => readDebugLogFile(logsDirectoryPath, entry.name))
    .sort((left, right) => right.updatedAtIso.localeCompare(left.updatedAtIso));
}

export function readDebugLogFile(logsDirectoryPath: string, id: string): DebugLogFileRecord {
  const filePath = resolveDebugLogFilePath(logsDirectoryPath, id);
  const stats = fs.statSync(filePath);
  return {
    id,
    name: id,
    path: filePath,
    sizeBytes: stats.size,
    updatedAtIso: stats.mtime.toISOString(),
  };
}

export function readDebugLogContent(logsDirectoryPath: string, id: string) {
  const file = readDebugLogFile(logsDirectoryPath, id);
  return {
    ...file,
    content: fs.readFileSync(file.path, 'utf8'),
  };
}

export function resolveDebugLogFilePath(logsDirectoryPath: string, id: string) {
  if (id !== path.basename(id) || !id.endsWith('.log')) {
    throw new Error(`Invalid debug log id: ${id}`);
  }

  return path.join(logsDirectoryPath, id);
}
