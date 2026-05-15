import { Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import { AgentInput, type RichComposerSubmitPayload } from '../../shared/agent-input/agent-input';

interface AgentsLaunchSectionProps {
  agentRegistriesLoading: boolean;
  agentRegistryId: string;
  agentRegistryOptions: SelectOption[];
  launching: boolean;
  onAgentRegistryIdChange: (agentRegistryId: string) => void;
  onLaunchAgent: (payload: RichComposerSubmitPayload) => void;
}

/**
 * New-agent launch surface.
 *
 * Picks a registry and hands the first turn straight to the shared rich
 * composer. /doc mentions inserted here ride through as structured
 * `documentReference` cells on the launch operation, so the agent's
 * opening turn includes resolved document snapshots.
 */
export function AgentsLaunchSection(props: AgentsLaunchSectionProps) {
  return (
    <Section title="Launch">
      <Surface>
        <Select
          fullWidth
          label="Agent"
          onChange={props.onAgentRegistryIdChange}
          options={props.agentRegistryOptions}
          placeholder={props.agentRegistriesLoading ? 'Loading agents' : 'Select agent'}
          value={props.agentRegistryId}
        />
        <AgentInput
          ariaLabel="Launch message"
          disabled={props.launching}
          draftStorageKey={`composer:agents:launch:${props.agentRegistryId}`}
          onSubmit={props.onLaunchAgent}
          placeholder="Enter to launch — / to reference a document"
          submitDisabled={props.agentRegistryId.length === 0}
        />
      </Surface>
    </Section>
  );
}
