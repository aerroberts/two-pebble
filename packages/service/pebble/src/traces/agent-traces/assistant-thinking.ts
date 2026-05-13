import type { DataCells } from '../../thread';

export interface PebbleAgentAssistantThinkingTrace {
  type: 'assistant-thinking';
  data: {
    content: DataCells;
  };
}
