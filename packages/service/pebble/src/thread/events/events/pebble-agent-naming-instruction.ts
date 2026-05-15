/// <reference path="../../../text-imports.d.ts" />

import pebbleAgentNamingInstructionRaw from './pebble-agent-naming-instruction.md?raw';

export function renderPebbleAgentNamingInstruction(agentId: string): string {
  return pebbleAgentNamingInstructionRaw.replaceAll('{{agentId}}', agentId);
}
