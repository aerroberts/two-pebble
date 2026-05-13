import type { CellContent, DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';

export interface AgentMessageInput {
  raw: string;
}

export function agentMessage(input: AgentMessageInput): DataCells {
  return [Cell.text(input.raw)];
}
