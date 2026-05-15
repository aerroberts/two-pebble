import { InputArea, Row } from '@two-pebble/components';
import { useState } from 'react';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';
import { joinTranscript } from './join-transcript';

interface AgentDetailChatViewFooterProps {
  chatDraft: string;
  chatSending: boolean;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: (override?: string) => void;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>('idle');
  const isRecording = voiceStatus === 'recording';
  const sendDisabled = props.chatSending || props.chatDraft.trim().length === 0;
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
        </Row>
      </div>
    </>
  );
}
