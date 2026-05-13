import type { AgentRunningIndicatorStatus } from '@two-pebble/components';
import { Button, InputArea, Row } from '@two-pebble/components';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';
import { joinTranscript } from './join-transcript';

interface AgentDetailChatViewFooterProps {
  agentStatus: AgentRunningIndicatorStatus;
  chatDraft: string;
  chatSending: boolean;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: () => void;
  onStop: () => void;
  stopping: boolean;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  const sendDisabled = props.chatSending || props.chatDraft.trim().length === 0;
  const isRunning = props.agentStatus === 'running';
  const submitFromTranscript = (text: string) => {
    const next = joinTranscript(props.chatDraft, text);
    props.onChatDraftChange(next);
    if (next.trim().length > 0 && !props.chatSending) {
      props.onChatSubmit();
    }
  };
  return (
    <>
      <InputArea
        aria-label="Follow-up message"
        disabled={props.chatSending}
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
      <Row gap="sm">
        <VoiceCaptureButton
          onTranscript={(text) => props.onChatDraftChange(joinTranscript(props.chatDraft, text))}
          onSubmitTranscript={submitFromTranscript}
        />
        {isRunning ? (
          <Button disabled={props.stopping} leftIcon="square" onClick={props.onStop}>
            {props.stopping ? 'Stopping' : 'Stop'}
          </Button>
        ) : null}
      </Row>
    </>
  );
}
