export interface ToolUseCellInput {
  callId: string;
  toolId: string;
  input: unknown;
}

export function toolUse(input: ToolUseCellInput) {
  return {
    type: 'toolUse' as const,
    content: { ...input },
  };
}
