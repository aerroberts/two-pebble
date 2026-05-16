import type { ToolInput, ToolResponseResult } from '@two-pebble/pebble';

/**
 * Defines the AgentToolCallOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
