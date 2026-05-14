import type { DataCells } from '../../thread';

export type ParentMessageDirection = 'ask' | 'message' | 'response';

export interface PebbleAgentParentMessageTrace {
  type: 'parent-message';
  data: {
    content: DataCells;
    direction: ParentMessageDirection;
    parentAgentId?: string;
  };
}
