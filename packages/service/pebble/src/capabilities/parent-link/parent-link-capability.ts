import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../agent';
import type { ParentLinkRunner, SubAgentMessage } from '../../agent/sub-agent-runners';
import { Cell, type DataCells } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';

const notifySchema = z.object({
  message: z.string(),
  expectsReply: z.boolean().optional(),
});

const askSchema = z.object({
  message: z.string(),
});

export class ParentLinkCapability extends AgentCapability {
  public readonly id = 'parent-link';
  public readonly description = 'Lets a Pebble child agent message its parent.';

  public override hookOnRegister() {
    return {
      tools: [
        new NativeTool({
          description: 'Send a message to the parent agent.',
          name: 'notify-parent-agent',
          schema: notifySchema,
        }).onInvoke(async (input) => {
          await this.requireRunner().notifyParent({
            expectsReply: input.expectsReply ?? false,
            message: input.message,
          });
          return ToolResponse.success([Cell.text('Sent message to parent.')]);
        }),
        new NativeTool({
          description: 'Ask the parent agent a question and wait for its reply.',
          name: 'ask-parent-agent',
          schema: askSchema,
        }).onInvoke(async (input) => {
          const reply = await this.requireRunner().askParent({
            message: input.message,
            toolCallId: crypto.randomUUID(),
          });
          return ToolResponse.success(messageCells(reply));
        }),
        new NativeTool({
          description: 'Read queued parent messages without waiting.',
          name: 'read-parent-agent-messages',
          schema: z.object({}),
        }).onInvoke(() => ToolResponse.success(messagesToCells(this.requireRunner().drainParentMessages()))),
      ],
    };
  }

  private requireRunner(): ParentLinkRunner {
    const runner = getCapabilityRunners(this.agent).parentLink;
    if (runner === undefined) throw new Error('parent-link runner is not installed.');
    return runner;
  }
}

function messageCells(message: SubAgentMessage): DataCells {
  return [Cell.header2(message.label), ...message.content];
}

function messagesToCells(messages: SubAgentMessage[]): DataCells {
  if (messages.length === 0) return [Cell.text('No queued parent messages.')];
  return messages.flatMap(messageCells);
}
