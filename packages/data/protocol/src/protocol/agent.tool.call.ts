import type { ToolInput, ToolResponseResult } from '@two-pebble/pebble';

export interface AgentToolCallOperation {
  name: 'callAgentTool';
  request: {
    agentId: string;
    input: ToolInput;
    toolId: string;
  };
  response: {
    result: ToolResponseResult;
  };
}
