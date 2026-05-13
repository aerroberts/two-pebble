import type { DataCells } from '../../thread/index';

export interface PebbleAgentToolCallSuccessTrace {
  type: 'tool-call-success';
  data: {
    result: DataCells;
    toolCallId: string;
  };
}
