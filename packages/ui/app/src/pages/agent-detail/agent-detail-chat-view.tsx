import type { AgentRunningIndicatorProps, AgentRunningIndicatorStatus } from '@two-pebble/components';
import { AgentRunningIndicator, AgentTrace, Button, InputArea, Row, Section, Surface } from '@two-pebble/components';
import type { AgentTraceRecord, LoadableRegistry } from '@two-pebble/realtime';
import { useSpeakText } from '../../shared/voice/use-speak-text';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';

const CHAT_HIDDEN_TRACE_TYPES = new Set<string>([
  'system-message',
  'worktree-initialized',
  'turn-start',
  'conversation-thread-snapshot',
  'state-snapshot',
  'model-call-start',
  'model-call-success',
  'model-call-failure',
  'capability-register',
  'capability-deregister',
]);

interface AgentDetailChatViewBodyProps {
  agentLoaded: boolean;
  agentStatus: AgentRunningIndicatorStatus;
  traces: LoadableRegistry<AgentTraceRecord>;
  agentTraces: AgentTraceRecord[];
  chatError: string;
  liveness: AgentRunningIndicatorProps['liveness'];
  onAgentClick: (agentId: string) => void;
  onModelCallClick: (modelCallId: string) => void;
  onTaskClick: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick: (threadCursor: string) => void;
  onWorktreeOpenClick: (worktreeId: string) => void;
}

export function AgentDetailChatViewBody(props: AgentDetailChatViewBodyProps) {
  const chatTraces = props.agentTraces.filter((trace) => !CHAT_HIDDEN_TRACE_TYPES.has(trace.type));
  const speech = useSpeakText();
  return (
    <Section>
      {props.agentLoaded ? null : <Surface>Loading agent.</Surface>}
      {chatTraces.length === 0 ? (
        <Surface>{props.traces.status === 'loading' ? 'Loading events.' : 'No events.'}</Surface>
      ) : null}
      {chatTraces.length > 0 ? (
        <AgentTrace
          onAgentClick={props.onAgentClick}
          onModelCallClick={props.onModelCallClick}
          speakController={speech.available ? speech : undefined}
          onTaskClick={props.onTaskClick}
          onThreadSnapshotClick={props.onThreadSnapshotClick}
          onWorktreeOpenClick={props.onWorktreeOpenClick}
          traces={chatTraces}
        />
      ) : null}
      <AgentRunningIndicator status={props.agentStatus} liveness={props.liveness} />
      {props.chatError.length > 0 ? <Surface>{props.chatError}</Surface> : null}
    </Section>
  );
}

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
            if (!sendDisabled) props.onChatSubmit();
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

function joinTranscript(existing: string, transcript: string): string {
  if (transcript.length === 0) return existing;
  if (existing.length === 0) return transcript;
  return existing.endsWith(' ') ? `${existing}${transcript}` : `${existing} ${transcript}`;
}
