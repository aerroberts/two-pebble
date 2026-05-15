import { Button, IconButton, Input, Section, Select, Surface } from '@two-pebble/components';
import type { AgentRegistryRecord, InferenceProfileRecord, LoadableRegistry } from '@two-pebble/realtime';
import { agentRegistryIcon } from '../../../../shared/agents/agent-registry-icon';
import type { SubAgentReferenceInput } from '../capabilities/types';

export interface SubAgentsSectionProps {
  references: SubAgentReferenceInput[];
  registryOptions: AgentRegistryRecord[];
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
  onChange: (references: SubAgentReferenceInput[]) => void;
}

/**
 * Edits the `sub-agent` capability's `agents` array. Each row carries
 * one reference (display name + description + which other registry to
 * spawn from); the registry dropdown is filtered to exclude the agent
 * being edited so the UI doesn't tempt the user into self-referencing.
 */
export function SubAgentsSection(props: SubAgentsSectionProps) {
  const handleAdd = () => {
    const placeholder = props.registryOptions[0];
    const next: SubAgentReferenceInput = {
      name: '',
      description: '',
      agentRegistryId: placeholder?.id ?? '',
    };
    props.onChange([...props.references, next]);
  };
  const handleRemove = (index: number) => {
    props.onChange(props.references.filter((_, i) => i !== index));
  };
  const handleUpdate = (index: number, patch: Partial<SubAgentReferenceInput>) => {
    props.onChange(props.references.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };
  return (
    <Section
      actionItems={
        props.registryOptions.length > 0 ? (
          <Button leftIcon="plus" onClick={handleAdd} type="button" variant="primary">
            Add sub-agent
          </Button>
        ) : null
      }
      title="Sub-agents"
    >
      {props.registryOptions.length === 0 ? (
        <Surface>Create another agent registry first; sub-agents are references to other agents.</Surface>
      ) : null}
      {props.references.length === 0 && props.registryOptions.length > 0 ? (
        <Surface>This agent has no sub-agents. Add one to let it spawn other agents at runtime.</Surface>
      ) : null}
      {props.references.map((reference, index) => (
        // The row's identifying fields (name/agentRegistryId) are user-editable,
        // so we cannot key by them — keying on a typed value would remount the
        // inputs on every keystroke and drop focus. Index is stable enough here
        // because rows are append/remove only, never reordered.
        // biome-ignore lint/suspicious/noArrayIndexKey: row identity is positional, see comment above
        <Surface key={index}>
          <Input
            label="Name"
            onChange={(event) => handleUpdate(index, { name: event.target.value })}
            placeholder="researcher"
            value={reference.name}
          />
          <Input
            label="Description"
            onChange={(event) => handleUpdate(index, { description: event.target.value })}
            placeholder="What this sub-agent is good at; the model picks based on this hint."
            value={reference.description}
          />
          <Select
            fullWidth
            label="Agent"
            onChange={(value) => handleUpdate(index, { agentRegistryId: value })}
            options={buildRegistryOptions(props.registryOptions, props.inferenceProfiles)}
            placeholder="Select agent"
            value={reference.agentRegistryId}
          />
          <IconButton
            aria-label={`Remove sub-agent ${reference.name}`}
            icon="trash-2"
            onClick={() => handleRemove(index)}
            type="button"
          />
        </Surface>
      ))}
    </Section>
  );
}

function buildRegistryOptions(registries: AgentRegistryRecord[], profiles: LoadableRegistry<InferenceProfileRecord>) {
  return registries.map((registry) => ({
    icon: agentRegistryIcon(registry, profiles),
    label: registry.name.length > 0 ? registry.name : registry.id,
    value: registry.id,
  }));
}
