import { Button, InputArea, Row, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';

interface AgentsLaunchSectionProps {
  agentRegistriesLoading: boolean;
  agentRegistryId: string;
  agentRegistryOptions: SelectOption[];
  launching: boolean;
  message: string;
  onAgentRegistryIdChange: (agentRegistryId: string) => void;
  onLaunchAgent: () => void;
  onMessageChange: (message: string) => void;
}

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
        <InputArea
          label="Message"
          onChange={(event) => props.onMessageChange(event.target.value)}
          value={props.message}
        />
        <Row gap="sm">
          <VoiceCaptureButton onTranscript={(text) => props.onMessageChange(joinTranscript(props.message, text))} />
          <Button
            disabled={props.launching || props.message.trim().length === 0 || props.agentRegistryId.length === 0}
            onClick={props.onLaunchAgent}
            rightIcon="arrow-right"
          >
            {props.launching ? 'Launching' : 'Launch agent'}
          </Button>
        </Row>
      </Surface>
    </Section>
  );
}

function joinTranscript(existing: string, transcript: string): string {
  if (transcript.length === 0) {
    return existing;
  }
  if (existing.length === 0) {
    return transcript;
  }
  return existing.endsWith(' ') ? `${existing}${transcript}` : `${existing} ${transcript}`;
}
