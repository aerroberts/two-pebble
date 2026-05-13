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

interface SubAgentReference {
  agentRegistryId: string;
  description?: string;
  name: string;
}

interface SubAgentCapabilityConfig {
  agents?: SubAgentReference[];
}

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

const listSchema = z.object({});

export class SubAgentCapability extends AgentCapability<SubAgentCapabilityConfig> {
  public readonly id = 'sub-agent';
  public readonly description = 'Lets a Pebble agent spawn and message child agents.';
  private readonly childrenSlot = this.useState<ChildRecord[]>('children', []);

  public override hookOnRegister(config: SubAgentCapabilityConfig) {
    const references = readReferences(config);
    const spawnSchema = z.object({
      referenceName: referenceNameSchema(references),
      message: z.string(),
    });

    return {
      tools: [
        new NativeTool({
          description: spawnToolDescription(references),
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
          description: 'List configured sub-agent reference names and spawned child agent ids.',
          name: 'list-sub-agents',
          schema: listSchema,
        }).onInvoke(() => ToolResponse.success(listSubAgentsCells(references, this.childrenSlot.value))),
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

function readReferences(config: SubAgentCapabilityConfig): SubAgentReference[] {
  if (!Array.isArray(config.agents)) return [];
  return config.agents.filter((agent) => agent.name.length > 0 && agent.agentRegistryId.length > 0);
}

function referenceNameSchema(references: SubAgentReference[]) {
  const names = references.map((reference) => reference.name);
  if (names.length === 0) return z.string().describe('Configured sub-agent reference name.');
  return z.enum(names as [string, ...string[]]).describe('Configured sub-agent reference name.');
}

function spawnToolDescription(references: SubAgentReference[]): string {
  if (references.length === 0) {
    return 'Spawn a child agent by configured reference name and send its initial message. No sub-agent references are currently configured.';
  }

  const referenceList = references
    .map((reference) => {
      const description =
        reference.description === undefined || reference.description.length === 0 ? '' : ` - ${reference.description}`;
      return `${reference.name}${description}`;
    })
    .join('; ');

  return `Spawn a child agent by configured reference name and send its initial message. Valid reference names: ${referenceList}`;
}

function listSubAgentsCells(references: SubAgentReference[], children: ChildRecord[]): DataCells {
  const referenceCells =
    references.length === 0
      ? [Cell.text('No configured sub-agent references.')]
      : references.map((reference) => {
          const description =
            reference.description === undefined || reference.description.length === 0
              ? ''
              : ` - ${reference.description}`;
          return Cell.text(`${reference.name}${description}`);
        });

  const childCells =
    children.length === 0
      ? [Cell.text('No spawned child agents.')]
      : children.map((child) => Cell.text(`${child.agentId} (${child.referenceName})`));

  return [
    Cell.header2('Configured sub-agents'),
    ...referenceCells,
    Cell.header2('Spawned child agents'),
    ...childCells,
  ];
}
