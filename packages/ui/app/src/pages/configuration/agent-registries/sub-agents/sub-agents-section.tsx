import { Checkbox, ListLayout, Section } from '@two-pebble/components';
import type {
  AgentRegistryRecord,
  InferenceProfileRecord,
  LoadableRegistry,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/realtime';
import { agentRegistryIcon } from '../../../../shared/agents/agent-registry-icon';
import type { SubAgentReferenceInput } from '../capabilities/types';

export interface SubAgentsSectionProps {
  references: SubAgentReferenceInput[];
  registryOptions: AgentRegistryRecord[];
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>;
  onChange: (references: SubAgentReferenceInput[]) => void;
}

/**
 * Edits the `sub-agent` capability's `agents` array.
 *
 * Lists every other agent registry as a row with a toggle: turning it
 * on attaches that registry as an invokable sub-agent, off detaches it.
 * The sub-agent reference uses the registry's own name as the
 * sub-agent name; per-instance description fields were removed in
 * favour of describing sub-agent intent in the parent agent's system
 * prompt.
 */
export function SubAgentsSection(props: SubAgentsSectionProps) {
  const referenceByRegistryId = new Map(props.references.map((reference) => [reference.agentRegistryId, reference]));

  const toggleRegistry = (registry: AgentRegistryRecord, enabled: boolean) => {
    if (enabled) {
      if (referenceByRegistryId.has(registry.id)) {
        return;
      }
      const next: SubAgentReferenceInput = {
        name: registry.name.length > 0 ? registry.name : registry.id,
        description: '',
        agentRegistryId: registry.id,
      };
      props.onChange([...props.references, next]);
      return;
    }
    props.onChange(props.references.filter((reference) => reference.agentRegistryId !== registry.id));
  };

  const items = props.registryOptions.map((registry) => {
    const reference = referenceByRegistryId.get(registry.id);
    const isAttached = reference !== undefined;
    const displayName = registry.name.length > 0 ? registry.name : registry.id;
    return {
      key: registry.id,
      icon: agentRegistryIcon(registry, props.inferenceProfiles, props.installs),
      title: displayName,
      subtitle: registry.id,
      trailingAccessory: (
        <Checkbox
          aria-label={`Allow ${displayName} as a sub-agent`}
          checked={isAttached}
          onChange={(event) => toggleRegistry(registry, event.target.checked)}
        />
      ),
    };
  });

  return (
    <Section title="Sub-agents">
      <ListLayout
        emptyState="Create another agent registry first; sub-agents are references to other agents."
        items={items}
      />
    </Section>
  );
}
