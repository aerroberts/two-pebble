import { AgentTrace, Section, Surface } from '@two-pebble/components';
import type { AgentTraceRecord, LoadableRegistry } from '@two-pebble/realtime';
import { useStickWindowToBottom } from '../../shared/scroll/use-stick-window-to-bottom';

interface AgentDetailTraceViewProps {
  agentLoaded: boolean;
  traces: LoadableRegistry<AgentTraceRecord>;
  agentTraces: AgentTraceRecord[];
  onAgentClick: (agentId: string) => void;
  onModelCallClick: (modelCallId: string) => void;
  onTaskClick: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick: (threadCursor: string) => void;
  onWorktreeOpenClick: (worktreeId: string) => void;
}

export function AgentDetailTraceView(props: AgentDetailTraceViewProps) {
  useStickWindowToBottom();
  return (
    <Section>
      {props.agentLoaded ? null : <Surface>Loading agent.</Surface>}
      {props.agentTraces.length === 0 ? (
        <Surface>{props.traces.status === 'loading' ? 'Loading events.' : 'No events.'}</Surface>
      ) : null}
      {props.agentTraces.length > 0 ? (
        <AgentTrace
          onAgentClick={props.onAgentClick}
          onModelCallClick={props.onModelCallClick}
          onTaskClick={props.onTaskClick}
          onThreadSnapshotClick={props.onThreadSnapshotClick}
          onWorktreeOpenClick={props.onWorktreeOpenClick}
          traces={props.agentTraces}
          exhaustive
        />
      ) : null}
    </Section>
  );
}
