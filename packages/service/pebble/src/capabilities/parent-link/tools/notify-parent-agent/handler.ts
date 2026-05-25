import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { ParentLinkCapability } from '../../capability';

const schema = z.object({
  message: z.string().min(1).describe('Message to send to the parent agent.'),
  expectsReply: z.boolean().optional().describe('When true, wait for the parent to reply.'),
});

/**
 * Builds the native tool that sends a child-to-parent notification.
 */
export function buildNotifyParentAgentTool(capability: ParentLinkCapability) {
  return new NativeTool({
    description: 'Send a message to the parent agent.',
    name: 'notify-parent-agent',
    schema,
  }).onInvoke((input) => capability.notifyParent(input.message, input.expectsReply === true));
}
