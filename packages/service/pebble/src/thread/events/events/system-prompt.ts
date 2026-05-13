import type { DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';

export interface SystemPromptInput {
  content: DataCells;
}

export function systemPrompt(input: SystemPromptInput): DataCells {
  return [Cell.header2('System prompt'), ...input.content];
}
