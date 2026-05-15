import type { AgentRunningIndicatorStatus } from '@two-pebble/components';
import { Button, InputArea, Row } from '@two-pebble/components';
import { useState } from 'react';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';
import { joinTranscript } from './join-transcript';

interface AgentDetailChatViewFooterProps {
  agentStatus: AgentRunningIndicatorStatus;
  chatDraft: string;
  chatSending: boolean;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: (override?: string) => void;
  onStop: () => void;
  stopping: boolean;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>('idle');
  const isRecording = voiceStatus === 'recording';
  const sendDisabled = props.chatSending || props.chatDraft.trim().length === 0;
  const isRunning = props.agentStatus === 'running';
  const submitFromTranscript = (text: string) => {
    const next = joinTranscript(props.chatDraft, text);
    props.onChatDraftChange(next);
    if (next.trim().length > 0 && !props.chatSending) {
      props.onChatSubmit(next);
    }
  };
  return (
    <>
      <InputArea
        aria-label="Follow-up message"
        disabled={props.chatSending || isRecording}
        onChange={(event) => props.onChatDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!sendDisabled) {
              props.onChatSubmit();
            }
          }
        }}
        placeholder="Send a follow-up message — Enter to send, Shift+Enter for newline"
        value={props.chatDraft}
      />
      <div
        className={`flex transition-[justify-content] duration-200 ease-out ${
          isRecording ? 'justify-center' : 'justify-start'
        }`}
      >
        <Row gap="sm">
          <VoiceCaptureButton
            onStatusChange={setVoiceStatus}
            onTranscript={(text) => props.onChatDraftChange(joinTranscript(props.chatDraft, text))}
            onSubmitTranscript={submitFromTranscript}
          />
          <div
            aria-hidden={isRecording || !isRunning}
            className={`overflow-hidden transition-[max-width,opacity,margin] duration-200 ease-out ${
              isRunning && !isRecording ? 'max-w-[12rem] opacity-100' : 'max-w-0 opacity-0 -ml-2'
            }`}
          >
            <Button disabled={props.stopping} leftIcon="square" onClick={props.onStop}>
              {props.stopping ? 'Stopping' : 'Stop'}
            </Button>
          </div>
        </Row>
      </div>
    </>
  );
}
