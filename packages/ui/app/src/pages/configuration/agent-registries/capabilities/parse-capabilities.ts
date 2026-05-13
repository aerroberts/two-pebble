import type {
  CapabilityConfigRecord,
  CapabilityConfigValue,
  CapabilitySpec,
  SubAgentCapabilityConfig,
  SubAgentReferenceInput,
} from './types';

interface CapabilitySpecLike {
  id?: CapabilityConfigValue;
  config?: CapabilityConfigValue;
}

/**
 * Parses the registry's `capabilities` JSON column into a typed list.
 * Returns an empty list on any malformed input — the UI falls back to
 * "no capabilities" rather than crashing on a single bad row.
 */
export function parseCapabilitiesJson(serialized: string): CapabilitySpec[] {
  let parsed: CapabilityConfigValue;
  try {
    parsed = JSON.parse(serialized) as CapabilityConfigValue;
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const result: CapabilitySpec[] = [];
  for (const entry of parsed) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const record = entry as CapabilitySpecLike;
    if (typeof record.id !== 'string') continue;
    result.push({ id: record.id, config: record.config ?? null });
  }
  return result;
}

/**
 * Splits a parsed capability list into "sub-agent references" (the one
 * sub-agent spec, if any) and "everything else" (the list of capability
 * specs the Capabilities section renders).
 */
export function splitCapabilities(specs: CapabilitySpec[]): SplitCapabilities {
  const subAgentSpec = specs.find((spec) => spec.id === 'sub-agent');
  const others = specs.filter((spec) => spec.id !== 'sub-agent');
  const references = readSubAgentReferences(subAgentSpec?.config);
  return { references, others };
}

/**
 * Merges the two views back into one list for persistence. Drops the
 * sub-agent spec entirely when no references are configured rather than
 * persisting an empty `agents: []` entry — keeps the JSON column tidy.
 */
export function mergeCapabilities(others: CapabilitySpec[], references: SubAgentReferenceInput[]): CapabilitySpec[] {
  if (references.length === 0) return others;
  const config: SubAgentCapabilityConfig = { agents: references };
  return [...others, { id: 'sub-agent', config }];
}

interface SplitCapabilities {
  references: SubAgentReferenceInput[];
  others: CapabilitySpec[];
}

function readSubAgentReferences(config: CapabilityConfigValue | undefined): SubAgentReferenceInput[] {
  if (config === undefined || config === null || typeof config !== 'object' || Array.isArray(config)) return [];
  const agents = (config as CapabilityConfigRecord).agents;
  if (!Array.isArray(agents)) return [];
  const result: SubAgentReferenceInput[] = [];
  for (const entry of agents) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const record = entry as Partial<SubAgentReferenceInput>;
    if (typeof record.name !== 'string') continue;
    if (typeof record.agentRegistryId !== 'string') continue;
    result.push({
      agentRegistryId: record.agentRegistryId,
      description: typeof record.description === 'string' ? record.description : '',
      name: record.name,
    });
  }
  return result;
}
