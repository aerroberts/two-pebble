import type { AgentRegistryWorkspaceConfig } from '@two-pebble/datatypes';
import type { PebbleJsonValue } from '@two-pebble/pebble';
import type { ParseWorkspaceConfigInput } from './types';

const FALLBACK_CONFIG: AgentRegistryWorkspaceConfig = { kind: 'absolute', path: process.cwd() };

/**
 * Parses the JSON `workspaceConfig` column off an agent registry row into a
 * discriminated workspace config union. Legacy 'cwd' rows coerce to an
 * absolute config rooted at the daemon's current working directory, and
 * legacy 'fixed' rows coerce to 'absolute' (same shape, new name).
 * Falls back to the daemon's cwd as an absolute path on any parse error so
 * a corrupt row can't lock an agent out of launching.
 */
export function parseWorkspaceConfig(input: ParseWorkspaceConfigInput): AgentRegistryWorkspaceConfig {
  const raw = input.registry.workspaceConfig;
  if (raw.length === 0) {
    return FALLBACK_CONFIG;
  }
  let parsed: PebbleJsonValue;
  try {
    parsed = JSON.parse(raw) as PebbleJsonValue;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('agent registry workspace config parse failed', {
      error: message,
      registryId: input.registry.id,
    });
    return FALLBACK_CONFIG;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    input.logger.warn('agent registry workspace config not object', { registryId: input.registry.id });
    return FALLBACK_CONFIG;
  }
  const record = parsed as Record<string, PebbleJsonValue | undefined>;
  const kind = record.kind;
  if (kind === 'none') {
    return { kind: 'none' };
  }
  if (kind === 'cwd') {
    return FALLBACK_CONFIG;
  }
  if (kind === 'absolute' && typeof record.path === 'string') {
    return { kind: 'absolute', path: record.path };
  }
  if (kind === 'fixed' && typeof record.path === 'string') {
    return { kind: 'absolute', path: record.path };
  }
  if (kind === 'worktree' && typeof record.repositoryId === 'string') {
    return { kind: 'worktree', repositoryId: record.repositoryId };
  }
  input.logger.warn('agent registry workspace config kind invalid', { registryId: input.registry.id });
  return FALLBACK_CONFIG;
}
