export interface ToolResultInnerCell {
  type: string;
  content: unknown;
}

export interface ToolResultCellInput {
  callId: string;
  toolId: string;
  success: boolean;
  content: ToolResultInnerCell[];
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
