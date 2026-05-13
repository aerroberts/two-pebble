import type { CellContent, DataCells } from '../../thread';

export interface PebbleAgentUserMessageTrace {
  type: 'user-message';
  data: {
    content: DataCells;
  };
}
