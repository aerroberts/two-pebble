import type { AgentRunningIndicatorProps, AgentRunningIndicatorStatus } from '@two-pebble/components';
import { AgentRunningIndicator, AgentTrace, Section, Surface } from '@two-pebble/components';
import type { AgentTraceRecord, LoadableRegistry } from '@two-pebble/realtime';
import { useSpeakText } from '../../shared/voice/use-speak-text';

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
