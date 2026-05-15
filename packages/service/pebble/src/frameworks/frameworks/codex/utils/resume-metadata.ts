import type { PebbleJsonRecord } from '../../../../types';

/**
 * Extracts the Codex thread id from a previously persisted resume metadata
 * blob. Tolerant of missing / malformed shapes so a stale snapshot doesn't
 * crash the launch path; the caller starts a fresh thread if the id can't
 * be read.
 */
export function readResumeThreadId(metadata: PebbleJsonRecord | undefined): string | undefined {
  if (metadata === undefined) {
    return undefined;
  }
  const value = metadata.threadId;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
