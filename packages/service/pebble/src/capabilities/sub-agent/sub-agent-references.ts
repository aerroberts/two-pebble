import type { SubAgentCapabilityConfig, SubAgentReference } from './sub-agent-types';

export function readReferences(config: SubAgentCapabilityConfig): SubAgentReference[] {
  if (!Array.isArray(config.agents)) return [];
  return config.agents.filter((agent) => agent.name.length > 0 && agent.agentRegistryId.length > 0);
}

export function spawnToolDescription(references: SubAgentReference[]): string {
  if (references.length === 0) {
    return 'Spawn a child agent by configured reference name and send its initial message. No sub-agent references are currently configured.';
  }

  const referenceList = references.map(referenceDescription).join('; ');
  return `Spawn a child agent by configured reference name and send its initial message. Valid reference names: ${referenceList}`;
}

function referenceDescription(reference: SubAgentReference): string {
  const description =
    reference.description === undefined || reference.description.length === 0 ? '' : ` - ${reference.description}`;
  return `${reference.name}${description}`;
}
