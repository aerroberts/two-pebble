import type { SubAgentCapabilityConfig, SubAgentReference } from './sub-agent-types';

export function readReferences(config: SubAgentCapabilityConfig): SubAgentReference[] {
  if (!Array.isArray(config.agents)) {
    return [];
  }
  return config.agents.filter((agent) => agent.name.length > 0 && agent.agentRegistryId.length > 0);
}

const LIFECYCLE_NOTE =
  'Each spawn starts a brand-new child agent. Framework children (e.g. claude-code) run to completion in a single turn — after they respond they are idle and do not keep working. Use spawn-sub-agent when starting a new line of work or when a prior child has already responded and you want a clean run; use ask-sub-agent to give an existing child another turn.';

export function spawnToolDescription(references: SubAgentReference[]): string {
  if (references.length === 0) {
    return `Spawn a child agent by configured reference name and wait for its response. No sub-agent references are currently configured. ${LIFECYCLE_NOTE}`;
  }

  const referenceList = references.map(referenceDescription).join('; ');
  return `Spawn a child agent by configured reference name and wait for its response. Valid reference names: ${referenceList}. ${LIFECYCLE_NOTE}`;
}

function referenceDescription(reference: SubAgentReference): string {
  const description =
    reference.description === undefined || reference.description.length === 0 ? '' : ` - ${reference.description}`;
  return `${reference.name}${description}`;
}
