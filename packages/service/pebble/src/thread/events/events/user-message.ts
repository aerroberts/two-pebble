import type { CellContent, DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';

export interface UserMessageInput {
  content: string;
}

export function userMessage(input: UserMessageInput): DataCells {
  return [
    Cell.header2('User message'),
    Cell.text('The user provided the following message:'),
    Cell.codeBlock('user', input.content),
  ];
}
