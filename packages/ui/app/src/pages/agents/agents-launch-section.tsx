import { Button, InputArea, Row, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import { useState } from 'react';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';
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
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>('idle');
  const isRecording = voiceStatus === 'recording';
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
          disabled={isRecording}
          label="Message"
          onChange={(event) => props.onMessageChange(event.target.value)}
          value={props.message}
        />
        <div
          className={`flex transition-[justify-content] duration-200 ease-out ${
            isRecording ? 'justify-center' : 'justify-start'
          }`}
        >
          <Row gap="sm">
            <VoiceCaptureButton
              onStatusChange={setVoiceStatus}
              onTranscript={(text) => props.onMessageChange(joinTranscript(props.message, text))}
            />
            <div
              aria-hidden={isRecording}
              className={`overflow-hidden transition-[max-width,opacity,margin] duration-200 ease-out ${
                isRecording ? 'max-w-0 opacity-0 -ml-2' : 'max-w-[14rem] opacity-100'
              }`}
            >
              <Button
                disabled={props.launching || props.message.trim().length === 0 || props.agentRegistryId.length === 0}
                onClick={props.onLaunchAgent}
                rightIcon="arrow-right"
              >
                {props.launching ? 'Launching' : 'Launch agent'}
              </Button>
            </div>
          </Row>
        </div>
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
