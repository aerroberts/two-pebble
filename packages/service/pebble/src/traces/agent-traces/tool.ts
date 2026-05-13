import type { DataCells } from '../../thread/index';

export interface PebbleAgentToolTrace {
  type: 'tool';
  data: {
    toolCallId: string;
    toolId: string;
    status: 'error' | 'pending' | 'success';
    duration?: number;
    error?: string;
    input: object;
    result?: DataCells;
    source?: 'cli' | 'framework' | 'native';
  };
}
