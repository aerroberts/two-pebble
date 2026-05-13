import type { CellContent, DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';

export interface ToolDeregistrationInput {
  name: string;
  reason: string | null;
}

export function toolDeregistration(input: ToolDeregistrationInput): DataCells {
  const reason = input.reason === null ? '' : ` Reason: ${input.reason}`;

  return [
    Cell.header1(`Tool Deregistration: ${input.name}`),
    Cell.text(
      `${input.name} has been deregistered and is no longer invokable. Please do not try to use it at this time. ${reason}`,
    ),
  ];
}
