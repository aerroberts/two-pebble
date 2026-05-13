import type { DataCells } from '../../thread';

export interface PebbleAgentSubAgentSuccessTrace {
  type: 'sub-agent-success';
  data: {
    agentInstanceId: string;
    output: DataCells;
  };
}
