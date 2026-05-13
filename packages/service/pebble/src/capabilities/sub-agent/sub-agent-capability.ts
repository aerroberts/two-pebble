import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../agent';
import type { SubAgentMessage, SubAgentRunner } from '../../agent/sub-agent-runners';
import { Cell, type DataCells } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';

interface ChildRecord {
  agentId: string;
  referenceName: string;
}

interface SubAgentCapabilityConfig {
  references?: { name: string; agentRegistryId: string }[];
}

const spawnSchema = z.object({
  referenceName: z.string(),
  message: z.string(),
});

const sendSchema = z.object({
  childAgentId: z.string(),
  message: z.string(),
});

const askSchema = z.object({
  childAgentId: z.string(),
  message: z.string(),
});

const childSchema = z.object({
  childAgentId: z.string(),
});

const killSchema = z.object({
  childAgentId: z.string(),
  reason: z.string(),
});

export class SubAgentCapability extends AgentCapability<SubAgentCapabilityConfig> {
  public readonly id = 'sub-agent';
  public readonly description = 'Lets a Pebble agent spawn and message child agents.';
  private readonly childrenSlot = this.useState<ChildRecord[]>('children', []);

  public override hookOnRegister(_config: SubAgentCapabilityConfig) {
    return {
      tools: [
        new NativeTool({
          description: 'Spawn a child agent by configured reference name and send its initial message.',
          name: 'spawn-sub-agent',
          schema: spawnSchema,
        }).onInvoke(async (input) => {
          const runner = this.requireRunner();
          const childAgentId = await runner.spawn(input);
          this.childrenSlot.set([
            ...this.childrenSlot.value,
            { agentId: childAgentId, referenceName: input.referenceName },
          ]);
          this.agent.emit('trace', {
            type: 'sub-agent-invoke',
            data: {
              agentInstanceId: childAgentId,
              agentTemplateId: input.referenceName,
              input: [Cell.text(input.message)],
            },
          });
          return ToolResponse.success([Cell.text(`Spawned ${childAgentId}.`)]);
        }),
        new NativeTool({
          description: 'Send a one-way message to a child agent.',
          name: 'send-sub-agent-message',
          schema: sendSchema,
        }).onInvoke(async (input) => {
          await this.requireRunner().send({
            childAgentId: input.childAgentId,
            expectsReply: false,
            message: input.message,
          });
          return ToolResponse.success([Cell.text(`Sent message to ${input.childAgentId}.`)]);
        }),
        new NativeTool({
          description: 'Ask a child agent a question and wait for its reply.',
          name: 'ask-sub-agent',
          schema: askSchema,
        }).onInvoke(async (input) => {
          const reply = await this.requireRunner().ask({
            childAgentId: input.childAgentId,
            message: input.message,
            toolCallId: crypto.randomUUID(),
          });
          this.agent.emit('trace', {
            type: 'sub-agent-success',
            data: {
              agentInstanceId: input.childAgentId,
              output: reply.content,
            },
          });
          return ToolResponse.success(messageCells(reply));
        }),
        new NativeTool({
          description: 'Read queued child messages without waiting.',
          name: 'read-sub-agent-messages',
          schema: childSchema,
        }).onInvoke((input) => ToolResponse.success(messagesToCells(this.requireRunner().drain(input)))),
        new NativeTool({
          description: 'Stop a child agent.',
          name: 'kill-sub-agent',
          schema: killSchema,
        }).onInvoke(async (input) => {
          await this.requireRunner().kill(input);
          return ToolResponse.success([Cell.text(`Stopped ${input.childAgentId}.`)]);
        }),
      ],
    };
  }

  private requireRunner(): SubAgentRunner {
    const runner = getCapabilityRunners(this.agent).subAgent;
    if (runner === undefined) throw new Error('sub-agent runner is not installed.');
    return runner;
  }
}

function messageCells(message: SubAgentMessage): DataCells {
  return [Cell.header2(message.label), ...message.content];
}

function messagesToCells(messages: SubAgentMessage[]): DataCells {
  if (messages.length === 0) return [Cell.text('No queued child messages.')];
  return messages.flatMap(messageCells);
}
