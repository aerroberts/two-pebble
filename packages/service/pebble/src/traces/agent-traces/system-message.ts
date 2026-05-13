import type { DataCells } from '../../thread';

export interface PebbleAgentSystemMessageTrace {
  type: 'system-message';
  data: {
    content: DataCells;
  };
}
