/// <reference path="../../../text-imports.d.ts" />

import type { CellContent, DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';
import agentNamingInstructionRaw from './agent-naming-instruction.md?raw';

export function agentNamingInstruction(agentId: string): DataCells {
  return [Cell.text(renderAgentNamingInstruction(agentId))];
}

export function renderAgentNamingInstruction(agentId: string): string {
  return agentNamingInstructionRaw.replaceAll('{{agentId}}', agentId);
}
