import type { TaskEventRecord as ProtocolTaskEventRecord, TaskStatusEvent } from '@two-pebble/protocol';

export interface DatastoreEventRow {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  kind: string;
  status: string;
  reason: string;
  data: string;
}

interface DelegationData {
  agentId: string;
  agentRegistryId: string;
  agentName: string;
}

interface UndelegationData {
  agentId: string;
}

export function rowToProtocolEvent(row: DatastoreEventRow): ProtocolTaskEventRecord {
  const base = {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    taskId: row.taskId,
    reason: row.reason,
  };
  if (row.kind === 'delegated') {
    const data = readDelegationData(row.data);
    return { ...base, kind: 'delegated', ...data };
  }
  if (row.kind === 'undelegated') {
    const data = readUndelegationData(row.data);
    return { ...base, kind: 'undelegated', ...data };
  }
  return { ...base, kind: 'status', status: row.status as TaskStatusEvent['status'] };
}

function readDelegationData(raw: string): DelegationData {
  const parsed = parseEventData(raw);
  return {
    agentId: parsed.agentId ?? '',
    agentRegistryId: parsed.agentRegistryId ?? '',
    agentName: parsed.agentName ?? '',
  };
}

function readUndelegationData(raw: string): UndelegationData {
  const parsed = parseEventData(raw);
  return { agentId: parsed.agentId ?? '' };
}

interface ParsedEventData {
  agentId?: string;
  agentRegistryId?: string;
  agentName?: string;
}

function parseEventData(raw: string): ParsedEventData {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as ParsedEventData) : {};
  } catch {
    return {};
  }
}
