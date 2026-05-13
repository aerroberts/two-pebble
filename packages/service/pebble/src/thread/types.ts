import type { DataCells } from './cells/index';

export type { DataCells };

export interface ConversationThreadCell {
  orderId: number;
  label: string;
  role: 'user' | 'assistant' | 'cache' | 'system';
  cells: DataCells;
}

export type ConversationThreadCells = ConversationThreadCell[];

export type ConversationThreadCellListener = (cell: ConversationThreadCell) => void;

export interface ConversationTurn {
  role: ConversationThreadCell['role'];
  cells: DataCells;
  raw: string;
}

export interface ConversationThreadInput {
  cells?: ConversationThreadCell[];
  threadId?: string;
}

export interface ConversationThreadPushInput {
  cells: DataCells;
  label: string;
  role: ConversationThreadCell['role'];
}
