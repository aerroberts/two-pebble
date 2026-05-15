import type { AgentRecord, AgentRegistryRecord, InferenceProfileRecord, IntegrationRecord } from '@two-pebble/realtime';

export type PricingDimensionKey =
  | 'charge'
  | 'provider'
  | 'modelId'
  | 'agentId'
  | 'inferenceProfileId'
  | 'integrationId';

export type PricingLabelLookup = Record<PricingDimensionKey, Map<string, string>>;

interface BuildPricingLabelLookupInput {
  agents: Iterable<AgentRecord>;
  agentRegistries: Iterable<AgentRegistryRecord>;
  inferenceProfiles: Iterable<InferenceProfileRecord>;
  integrations: Iterable<IntegrationRecord>;
}

/**
 * Builds a per-dimension display-name map for the pricing pages.
 *
 * The by-agent map prefers the registry name over the per-instance agent name
 * so framework agents and Pebble agents read consistently and the report is
 * not littered with raw instance ids.
 */
export function buildPricingLabelLookup(input: BuildPricingLabelLookupInput): PricingLabelLookup {
  const registryNameById = new Map<string, string>();
  for (const registry of input.agentRegistries) {
    registryNameById.set(registry.id, registry.name || registry.id);
  }
  const agentMap = new Map<string, string>();
  for (const agent of input.agents) {
    const registryName =
      agent.agentRegistryId === null || agent.agentRegistryId === undefined
        ? undefined
        : registryNameById.get(agent.agentRegistryId);
    agentMap.set(agent.id, registryName ?? agent.name ?? agent.id);
  }
  const integrationMap = new Map<string, string>();
  for (const integration of input.integrations) {
    integrationMap.set(integration.id, integration.name || integration.id);
  }
  const profileMap = new Map<string, string>();
  for (const profile of input.inferenceProfiles) {
    profileMap.set(profile.id, profile.name || profile.id);
  }
  return {
    charge: new Map(),
    provider: new Map(),
    modelId: new Map(),
    agentId: agentMap,
    inferenceProfileId: profileMap,
    integrationId: integrationMap,
  };
}
