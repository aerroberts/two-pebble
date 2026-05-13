import type { PebbleJsonRecord } from '@two-pebble/pebble';
import type { CapabilitySpec } from '../register-pebble-capabilities';
import type { SubAgentReferenceMap } from './runner-types';

interface SubAgentReferenceLike {
  agentRegistryId?: string;
  name?: string;
}

/**
 * Reads the `agents` array from a `sub-agent` capability spec config and
 * returns a map from reference name → registry id. Used by the parent-
 * side runner to resolve `spawn({ referenceName })` requests at runtime.
 */
export function readSubAgentReferenceMap(specs: CapabilitySpec[]): SubAgentReferenceMap {
  const result = new Map<string, string>();
  const subAgentSpec = specs.find((spec) => spec.id === 'sub-agent');
  if (subAgentSpec === undefined) return result;
  const config = subAgentSpec.config;
  if (config === null || typeof config !== 'object' || Array.isArray(config)) return result;
  const agents = (config as PebbleJsonRecord).agents;
  if (!Array.isArray(agents)) return result;
  for (const entry of agents) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const record = entry as SubAgentReferenceLike;
    if (typeof record.name !== 'string' || typeof record.agentRegistryId !== 'string') continue;
    result.set(record.name, record.agentRegistryId);
  }
  return result;
}
