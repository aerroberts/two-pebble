import type { CellContent, DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';

export interface ToolInvokeResultInput {
  id: string;
  name: string;
  content: CellContent | DataCells;
  duration: number;
  error: string | null;
  success: boolean;
}

export function toolInvokeResult(input: ToolInvokeResultInput): DataCells {
  const content = Array.isArray(input.content) ? input.content : [input.content];

  return [
    Cell.toolResult({
      callId: input.id,
      toolId: input.name,
      success: input.success,
      error: input.error,
      content,
    }),
  ];
}
