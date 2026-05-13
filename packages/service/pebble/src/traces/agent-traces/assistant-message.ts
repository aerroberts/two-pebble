import type { DataCells } from '../../thread';

export interface PebbleAgentAssistantMessageTrace {
  type: 'assistant-message';
  data: {
    content: DataCells;
  };
}
