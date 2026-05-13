import type { DataCells } from '../types';

export interface ToolResultCellInput {
  callId: string;
  toolId: string;
  success: boolean;
  content: DataCells;
  error?: string | null;
}

export function toolResult(input: ToolResultCellInput) {
  return {
    type: 'toolResult' as const,
    content: {
      callId: input.callId,
      toolId: input.toolId,
      success: input.success,
      content: input.content,
      error: input.error ?? null,
    },
  };
}
