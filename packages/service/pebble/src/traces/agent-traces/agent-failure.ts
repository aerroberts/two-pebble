import type { DataCells } from '../../thread';

export interface PebbleAgentFailureTrace {
  type: 'agent-failure';
  data: {
    error: string;
    content: DataCells;
  };
}
