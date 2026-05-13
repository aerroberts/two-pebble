import type { ProtocolTaskRecord } from '@two-pebble/protocol';
import type { TaskBoard } from '@two-pebble/tasks';
import type { DatastoreTaskRow } from './task-board-service-types';

export function toProtocolTask(row: DatastoreTaskRow, engine: TaskBoard): ProtocolTaskRecord {
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    boardId: row.boardId,
    poolId: row.poolId,
    name: row.name,
    description: row.description ?? '',
    ownerId: row.ownerId ?? null,
    status: row.status as ProtocolTaskRecord['status'],
    effectiveStatus: engine.getTaskStatus(row.id),
  };
}
