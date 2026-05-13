import { TaskStatusIcon } from '../tasks/task-status-icon/task-status-icon';
import type { TaskStatusIconStatus } from '../tasks/task-status-icon/types';
import { AgentTraceItem } from './agent-trace-item';
import type { TraceComponentProps } from './types';

type TaskListUpdateStatus = 'pending' | 'open' | 'completed' | 'invalid';

const STATUS_ICON: Record<TaskListUpdateStatus, TaskStatusIconStatus> = {
  pending: 'waiting',
  open: 'working',
  completed: 'success',
  invalid: 'failure',
};

/**
 * Renders the latest task-list snapshot inline in the trace stream. Shows
 * each task with a status icon and description so the reader can see the
 * current state of the list, regardless of whether the trace was emitted
 * by a Pebble capability or wrapped from a framework's todo tool.
 */
export function TaskListUpdateTrace(props: TraceComponentProps<'task-list-update'>) {
  const tasks = props.trace.data.tasks;
  return (
    <AgentTraceItem
      icon="ListChecks"
      timestamp={props.trace.createdAt}
      title={tasks.length === 0 ? 'Task list updated' : `Task list (${tasks.length})`}
      status="atomic"
      content={
        <div className="flex flex-col gap-1.5 px-1 py-1">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 shrink-0">
                <TaskStatusIcon status={STATUS_ICON[task.status]} size="sm" />
              </span>
              <span className="text-content">{task.description}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}
