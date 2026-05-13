import type { DataCells } from '../../thread/index';

export interface PebbleAgentToolCallFailureTrace {
  type: 'tool-call-failure';
  data: {
    toolCallId: string;
    result: DataCells;
    error: string;
  };
}
