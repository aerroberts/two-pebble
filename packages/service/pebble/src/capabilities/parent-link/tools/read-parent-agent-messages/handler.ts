import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { ParentLinkCapability } from '../../capability';

const schema = z.object({});

/**
 * Builds the native tool that explains parent messages arrive as signals.
 */
export function buildReadParentAgentMessagesTool(_capability: ParentLinkCapability) {
  return new NativeTool({
    description: 'Read queued parent messages without waiting.',
    name: 'read-parent-agent-messages',
    schema,
  }).onInvoke(() => ToolResponse.success([Cell.text('No queued parent messages. Signal responses resume the agent.')]));
}
