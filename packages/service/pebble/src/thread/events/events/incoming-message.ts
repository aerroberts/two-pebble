import type { DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';

export interface IncomingMessageInput {
  content: DataCells;
}

export function incomingMessage(input: IncomingMessageInput): DataCells {
  return [Cell.header2('User message'), Cell.text('The user provided the following message:'), ...input.content];
}
