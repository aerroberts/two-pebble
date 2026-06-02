import type { ProtocolTaskRecord } from '@two-pebble/protocol';
import type { TaskBoard } from '@two-pebble/tasks';
import type { DatastoreTaskRow } from './types';

export function toProtocolTask(row: DatastoreTaskRow, engine: TaskBoard): ProtocolTaskRecord {
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    boardId: row.boardId,
    poolId: row.poolId,
    name: row.name,
    description: row.description ?? '',
    descriptionContent: row.descriptionContent ?? null,
    templateId: row.templateId ?? null,
    additionalContext: row.additionalContext ?? '',
    status: row.status as ProtocolTaskRecord['status'],
    effectiveStatus: engine.getTaskStatus(row.id),
  };
}
