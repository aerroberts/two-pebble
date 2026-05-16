import type { SubAgentCapabilityConfig, SubAgentReference } from './sub-agent-types';

export function readReferences(config: SubAgentCapabilityConfig): SubAgentReference[] {
  if (!Array.isArray(config.agents)) {
    return [];
  }
  return config.agents.filter((agent) => agent.name.length > 0 && agent.agentRegistryId.length > 0);
}

const LIFECYCLE_NOTE =
  'Each spawn starts a brand-new child agent. Framework children (e.g. claude-code) run to completion in a single turn — after they respond they are idle and do not keep working. Use spawn-sub-agent when starting a new line of work or when a prior child has already responded and you want a clean run; use ask-sub-agent to give an existing child another turn.';

const MESSAGE_GUIDANCE =
  'The `message` is the only context the child receives, so treat it as a complete brief — aim for 500+ words. Include: (1) the goal in your own words and why it matters, (2) the specific deliverables you expect back, (3) any constraints (style, scope, dependencies, tools to avoid), (4) the success criteria you will use to judge the result, (5) the relevant context and prior work the child should know, and (6) any examples or anti-examples. Vague one-liners produce unreliable, off-target output — write the brief you would want from a manager.';

export function spawnToolDescription(references: SubAgentReference[]): string {
  if (references.length === 0) {
    return `Spawn a child agent by configured reference name and wait for its response. No sub-agent references are currently configured. ${LIFECYCLE_NOTE} ${MESSAGE_GUIDANCE}`;
  }

  const referenceList = references.map(referenceDescription).join('; ');
  return `Spawn a child agent by configured reference name and wait for its response. Valid reference names: ${referenceList}. ${LIFECYCLE_NOTE} ${MESSAGE_GUIDANCE}`;
}

function referenceDescription(reference: SubAgentReference): string {
  const description =
    reference.description === undefined || reference.description.length === 0 ? '' : ` - ${reference.description}`;
  return `${reference.name}${description}`;
}
