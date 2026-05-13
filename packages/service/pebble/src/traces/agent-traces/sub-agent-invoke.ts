import type { CellContent, DataCells } from '../../thread';

export interface PebbleAgentSubAgentInvokeTrace {
  type: 'sub-agent-invoke';
  data: {
    agentInstanceId: string;
    agentTemplateId: string;
    input: DataCells;
  };
}
