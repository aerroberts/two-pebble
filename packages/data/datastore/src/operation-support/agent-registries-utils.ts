import type { AgentRegistryRecord } from '../types';

type StoredAgentRegistryRow = Omit<AgentRegistryRecord, 'kind'>;

/**
 * Computes the AgentRegistryKind derived from which optional id is set —
 * 'framework' when `thirdPartyAgentInstallId` is populated, 'pebble' for
 * every other shape. The column previously persisted this discriminator
 * directly; the value is now attached on read by the agent-registries
 * operations so consumers keep getting `record.kind`.
 */
export function attachDerivedAgentRegistryKind(row: StoredAgentRegistryRow): AgentRegistryRecord {
  return { ...row, kind: row.thirdPartyAgentInstallId !== null ? 'framework' : 'pebble' };
}
