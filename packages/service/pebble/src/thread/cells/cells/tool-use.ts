import type { ToolInput } from '../../../agent/tools/tool-input';

export interface ToolUseCellInput {
  callId: string;
  toolId: string;
  input: ToolInput;
}

export function toolUse(input: ToolUseCellInput) {
  return {
    type: 'toolUse' as const,
    content: { ...input },
  };
}
