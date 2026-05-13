import type { WorkspaceConfig } from '@two-pebble/realtime';

const DEFAULT_CONFIG: WorkspaceConfig = { kind: 'absolute', path: '' };

interface ParsedConfigCandidate {
  kind?: string;
  path?: string;
  repositoryId?: string;
}

/**
 * Parses the JSON `workspaceConfig` column off an agent registry row into a
 * discriminated workspace config union. Legacy 'cwd' and 'fixed' kinds are
 * coerced to 'absolute' so existing rows keep loading. Falls back to an
 * empty absolute config on any parse error so a corrupt row can't lock the
 * UI out of editing.
 */
export function parseWorkspaceConfigString(raw: string): WorkspaceConfig {
  if (raw.length === 0) {
    return DEFAULT_CONFIG;
  }
  try {
    const parsed = JSON.parse(raw) as ParsedConfigCandidate;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return DEFAULT_CONFIG;
    }
    if (parsed.kind === 'none') {
      return { kind: 'none' };
    }
    if (parsed.kind === 'absolute' && typeof parsed.path === 'string') {
      return { kind: 'absolute', path: parsed.path };
    }
    if (parsed.kind === 'fixed' && typeof parsed.path === 'string') {
      return { kind: 'absolute', path: parsed.path };
    }
    if (parsed.kind === 'cwd') {
      return DEFAULT_CONFIG;
    }
    if (parsed.kind === 'worktree' && typeof parsed.repositoryId === 'string') {
      return { kind: 'worktree', repositoryId: parsed.repositoryId };
    }
    return DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Serializes a workspace config back to JSON for persistence on the agent
 * registry row. The daemon reads the same shape via parseWorkspaceConfig.
 */
export function serializeWorkspaceConfig(config: WorkspaceConfig): string {
  return JSON.stringify(config);
}
