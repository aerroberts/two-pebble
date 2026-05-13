import type { CellContent, DataCells } from '../../thread';

export interface PebbleAgentSuccessTrace {
  type: 'agent-success';
  data: {
    content: DataCells;
  };
}
