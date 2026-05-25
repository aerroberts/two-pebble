import spawnLifecycleNotePrompt from '../prompts/spawn-lifecycle-note.md?raw';
import spawnMessageGuidancePrompt from '../prompts/spawn-message-guidance.md?raw';
import type { SubAgentCapabilityConfig, SubAgentReference } from './sub-agent-types';

export function readReferences(config: SubAgentCapabilityConfig): SubAgentReference[] {
  if (!Array.isArray(config.agents)) {
    return [];
  }
  return config.agents.filter((agent) => agent.name.length > 0 && agent.agentRegistryId.length > 0);
}

const LIFECYCLE_NOTE = spawnLifecycleNotePrompt;

const MESSAGE_GUIDANCE = spawnMessageGuidancePrompt;

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
