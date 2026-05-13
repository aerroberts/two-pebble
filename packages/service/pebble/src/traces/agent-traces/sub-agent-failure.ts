import type { DataCells } from '../../thread';

export interface PebbleAgentSubAgentFailureTrace {
  type: 'sub-agent-failure';
  data: {
    agentInstanceId: string;
    error: string;
    output: DataCells;
  };
}
