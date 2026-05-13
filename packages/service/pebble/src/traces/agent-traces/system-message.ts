import type { CellContent, DataCells } from '../../thread';

export interface PebbleAgentSystemMessageTrace {
  type: 'system-message';
  data: {
    content: DataCells;
  };
}
