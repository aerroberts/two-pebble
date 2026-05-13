import type { ConversationThreadCell, DataCells } from '@two-pebble/pebble';

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
