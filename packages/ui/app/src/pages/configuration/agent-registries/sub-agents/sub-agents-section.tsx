import { Button, IconButton, Input, Section, Select, Surface } from '@two-pebble/components';
import type { AgentRegistryRecord } from '@two-pebble/realtime';
import type { SubAgentReferenceInput } from '../capabilities/types';

export interface SubAgentsSectionProps {
  references: SubAgentReferenceInput[];
  registryOptions: AgentRegistryRecord[];
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
        <Surface key={`${index}-${reference.name}`}>
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
            options={buildRegistryOptions(props.registryOptions)}
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

function buildRegistryOptions(registries: AgentRegistryRecord[]) {
  return registries.map((registry) => ({
    label: registry.name.length > 0 ? registry.name : registry.id,
    value: registry.id,
  }));
}
