import type { TaskBoardEventRecord, TaskBoardPoolNode, TaskBoardTaskNode, TaskStatus } from '@two-pebble/pebble';
import type { DaemonTaskBoardRunnerEvent, TaskBoardPoolRecord, TaskBoardTaskRecord } from './daemon-task-board-runner-types';

export function toPool(record: TaskBoardPoolRecord): TaskBoardPoolNode {
  return { id: record.id, name: record.name, parentPoolId: record.parentPoolId };
}

export function toTask(record: TaskBoardTaskRecord): TaskBoardTaskNode {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    poolId: record.poolId,
    status: record.status as TaskStatus,
    effectiveStatus: record.effectiveStatus as TaskStatus | 'blocked',
    ownerId: record.ownerId,
  };
}

export function toRunnerEvent(event: DaemonTaskBoardRunnerEvent): TaskBoardEventRecord {
  const kind = event.kind === 'delegated' || event.kind === 'undelegated' ? event.kind : 'status';
  return {
    id: event.id,
    kind,
    taskId: event.taskId,
    reason: event.reason,
    createdAt: event.createdAt,
    ...(event.status === undefined ? {} : { status: event.status as TaskStatus }),
    ...(event.agentId === undefined ? {} : { agentId: event.agentId }),
    ...(event.agentName === undefined ? {} : { agentName: event.agentName }),
  };
}
