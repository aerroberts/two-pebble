import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function TaskAssignedTrace(props: TraceComponentProps<'task-assigned'>) {
  const { taskId, taskName, boardId } = props.trace.data;
  return (
    <TraceRow
      icon="ListChecks"
      onClick={props.onTaskClick === undefined ? undefined : () => props.onTaskClick?.(boardId, taskId)}
      timestamp={props.trace.createdAt}
      title={`Assigned to: ${taskName}`}
      data={{ taskId, boardId }}
    />
  );
}
