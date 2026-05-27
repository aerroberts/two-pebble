import type { AgentRunningIndicatorProps, AgentRunningIndicatorStatus } from '@two-pebble/components';
import { AgentRunningIndicator, AgentTrace, Section, Status, Surface } from '@two-pebble/components';
import type { AgentTraceRecord, LoadableRegistry } from '@two-pebble/realtime';
import { useSpeakText } from '../../shared/voice/use-speak-text';
import type { AgentQueuedMessageRecord } from './use-agent-detail-page-state';

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
  onDocumentClick: (documentId: string) => void;
  onModelCallClick: (modelCallId: string) => void;
  onStop?: () => void;
  stopping?: boolean;
  onTaskClick: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick: (threadCursor: string) => void;
  onWorktreeOpenClick: (worktreeId: string) => void;
  queuedMessages?: AgentQueuedMessageRecord[];
  waitingReasons?: string[];
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
          onDocumentClick={props.onDocumentClick}
          onModelCallClick={props.onModelCallClick}
          speakController={speech.available ? speech : undefined}
          onTaskClick={props.onTaskClick}
          onThreadSnapshotClick={props.onThreadSnapshotClick}
          onWorktreeOpenClick={props.onWorktreeOpenClick}
          traces={chatTraces}
        />
      ) : null}
      <AgentRunningIndicator
        liveness={props.liveness}
        onStop={props.onStop}
        status={props.agentStatus}
        stopping={props.stopping}
        waitingReasons={props.waitingReasons}
      />
      {props.queuedMessages !== undefined && props.queuedMessages.length > 0 ? (
        <Surface>
          <div className="flex flex-col gap-3">
            {props.queuedMessages.map((message) => (
              <div key={message.id} className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 text-sm text-content">{renderQueuedMessageText(message)}</div>
                <Status
                  state={queuedMessageStatusToStatusState(message.status)}
                  variant="pill"
                  label={message.status}
                />
              </div>
            ))}
          </div>
        </Surface>
      ) : null}
      {props.chatError.length > 0 ? <Surface>{props.chatError}</Surface> : null}
    </Section>
  );
}

function queuedMessageStatusToStatusState(status: AgentQueuedMessageRecord['status']) {
  if (status === 'sent') {
    return 'success';
  }
  if (status === 'failed') {
    return 'failed';
  }
  return 'in-progress';
}

function renderQueuedMessageText(message: AgentQueuedMessageRecord) {
  const text = message.cells
    .map((cell) => {
      if (cell.type === 'text' || cell.type === 'header1' || cell.type === 'header2') {
        return cell.content.text;
      }
      if (cell.type === 'codeBlock') {
        return cell.content.code;
      }
      if (cell.type === 'data') {
        return JSON.stringify(cell.content.value);
      }
      if (cell.type === 'documentReference') {
        return cell.content.name;
      }
      if (cell.type === 'boardReference') {
        return cell.content.name;
      }
      return '';
    })
    .filter((value) => value.length > 0)
    .join('\n');
  return message.status === 'failed' && message.lastError !== null ? `${text}\n${message.lastError}` : text;
}
