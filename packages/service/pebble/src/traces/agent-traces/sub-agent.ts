import type { CellContent, DataCells } from '../../thread';

export interface PebbleAgentSubAgentTrace {
  type: 'sub-agent';
  data: {
    agentInstanceId: string;
    agentTemplateId: string;
    error?: string;
    input: DataCells;
    output?: DataCells;
    status: 'error' | 'pending' | 'success';
  };
}
