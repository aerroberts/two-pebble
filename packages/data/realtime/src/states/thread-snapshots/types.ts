import type { ConversationThreadCell, DataCells } from '@two-pebble/pebble';

export interface ReadThreadSnapshotInput {
  orderId?: number;
  threadId: string;
}

export interface ThreadSnapshotCellRecord {
  agentId: string;
  orderId: number;
  content: DataCells;
  id: string;
  label: string;
  role: ConversationThreadCell['role'];
  threadId: string;
}

export interface ThreadSnapshotRecord {
  orderId: number | null;
  items: ThreadSnapshotCellRecord[];
  threadId: string;
}

export interface ThreadSummaryRecord {
  agentIds: string[];
  cellCount: number;
  createdAt: number;
  threadId: string;
  updatedAt: number;
}

export interface ListThreadsResult {
  items: ThreadSummaryRecord[];
}
