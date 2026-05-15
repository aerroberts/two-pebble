import { AgentTraceItem } from './agent-trace-item';
import { TraceBodyCell } from './trace-body-cell';
import type { TraceComponentProps } from './types';

export function TaskAssignedTrace(props: TraceComponentProps<'task-assigned'>) {
  const { taskId, taskName, taskDescription, boardId } = props.trace.data;
  // Pre-`taskDescription` traces (recorded before the field was added) have no
  // description on disk; default to empty so the render path is uniform.
  const trimmed = typeof taskDescription === 'string' ? taskDescription.trim() : '';
  return (
    <AgentTraceItem
      icon="ListChecks"
      onClick={props.onTaskClick === undefined ? undefined : () => props.onTaskClick?.(boardId, taskId)}
      timestamp={props.trace.createdAt}
      title={`Assigned to: ${taskName}`}
      status="atomic"
      content={trimmed.length === 0 ? undefined : <TraceBodyCell type="plaintext" data={trimmed} maxHeight={200} />}
    />
  );
}
