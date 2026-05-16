import type { ConversationThreadCell, DataCells } from '@two-pebble/pebble';

/**
 * Defines the ThreadSnapshotReadOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThreadSnapshotReadOperation {
  name: 'readThreadSnapshot';
  request: {
    orderId?: number;
    threadId: string;
  };
  response: {
    orderId: number | null;
    items: {
      agentId: string;
      orderId: number;
      content: DataCells;
      id: string;
      label: string;
      role: ConversationThreadCell['role'];
      threadId: string;
    }[];
    threadId: string;
  };
}
