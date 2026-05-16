import { parseAgentSystemPrompt } from '@two-pebble/datatypes';
import type { AgentRegistryRecord } from '../types';

type StoredAgentRegistryRow = Omit<AgentRegistryRecord, 'kind' | 'systemPrompt'> & { systemPrompt: string };

/**
 * Hydrates an agent registry row read from SQLite. Parses the JSON
 * system prompt into a TipTap document and computes the derived
 * `kind` discriminator ('framework' when `thirdPartyAgentInstallId` is
 * populated, 'pebble' otherwise). Legacy rows persisted as raw markdown
 * are wrapped into a flat TipTap doc by `parseAgentSystemPrompt`.
 */
export function attachDerivedAgentRegistryKind(row: StoredAgentRegistryRow): AgentRegistryRecord {
  return {
    ...row,
    systemPrompt: parseAgentSystemPrompt(row.systemPrompt),
    kind: row.thirdPartyAgentInstallId !== null ? 'framework' : 'pebble',
  };
}
