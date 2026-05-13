import type { DataCells } from '../../thread';

export interface PebbleAgentSuccessTrace {
  type: 'agent-success';
  data: {
    content: DataCells;
  };
}
