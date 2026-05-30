import type { ProjectRecord } from '../types';

type ProjectRow = Omit<ProjectRecord, 'enabledAgentRegistryIds'> & {
  enabledAgentRegistryIds: string;
};

/**
 * Converts a raw projects row into a `ProjectRecord`, parsing the JSON-encoded
 * `enabled_agent_registry_ids` column into a string array. Malformed JSON falls
 * back to an empty list so a corrupt column never crashes a read.
 */
export function toProjectRecord(row: ProjectRow): ProjectRecord {
  let enabledAgentRegistryIds: string[] = [];
  try {
    const parsed = JSON.parse(row.enabledAgentRegistryIds);
    if (Array.isArray(parsed)) {
      enabledAgentRegistryIds = parsed.filter((entry): entry is string => typeof entry === 'string');
    }
  } catch {
    enabledAgentRegistryIds = [];
  }
  return { ...row, enabledAgentRegistryIds };
}
